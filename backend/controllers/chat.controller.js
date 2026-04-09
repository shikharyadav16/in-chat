const User = require('../models/User');
const Chat = require('../models/Chat');
const asyncHandler = require('../utils/asyncHandler');
const getGroupRoomId = require('../utils/getGroupRoomId');
const RoomValidator = require('../validators/validations/RoomValidator');

const handleGetDirectChats = asyncHandler(async (req, res) => {

    // When user clicks on a direct chat, we need to check if the direct chat exists or not.
    // If it exists, we return the chatId and contactName.
    // If it doesn't exist, we create chatId and return chatId contactName.

    const targetId = req.params?.userId;
    const { userId } = req.user;

    if (!targetId || typeof targetId !== "string" || targetId.trim() === "") {
        return res.status(400).json({ success: false, message: "Invalid User ID" });
    }

    if (targetId === userId) {
        return res.status(400).json({ success: false, message: "Cannot chat with yourself" });
    }

    const targetUser = await User.findOne({ userId: targetId }).select("username");

    if (!targetUser) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const participants = [userId, targetId].sort();

    let chat = await Chat.findOne({
        type: "peer",
        participants: { $all: participants }
    });

    let user = await User.findOne({ userId }).select("contacts");
    let contact = user.contacts.find(c => c.userId === targetId);
    let contactName = contact ? contact.name : null;
    let isNew = false;

    if (!chat) {
        chat = await Chat.create({
            chatId: getGroupRoomId(),
            participants,
            type: "peer"
        });
        isNew = true;
    }

    return res.status(200).json({
        success: true,
        chatId: chat.chatId,
        isNew,
        contactName: contactName || targetUser.username
    });
});

const handleGetGroupChats = asyncHandler(async (req, res) => {

    // When user clicks on a group chat, we need to check if the group chat exists or not.
    // If it exists, we return the chatId and chatName.
    // If it doesn't exist, we return an error message.

    const roomId = req.params?.roomId;

    if (!roomId || typeof roomId !== "string" || roomId.trim() === "") {
        return res.status(400).json({ success: false, message: "Invalid Room ID" });
    }

    const chat = await Chat.findOne({ chatId: roomId, type: "group" });

    if (!chat) {
        return res.status(404).json({ success: false, message: "Group chat not found" });
    }
    return res.status(200).json({ success: true, chatId: chat.chatId, chatName: chat.chatName });
});

const handleCreateNewChat = asyncHandler(async (req, res) => {

    // When user clicks on create new chat, we need to check if the chat already exists or not.
    // If it doesn't exist, we create a new chat and return the chatId and contactName.

    const { participants = [], type } = req.body;
    const userId = req.user?.userId;

    if (!type || !["peer", "group"].includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid chat type" });
    }

    if (!Array.isArray(participants)) {
        return res.status(400).json({ success: false, message: "Participants must be an array" });
    }

    const uniqueParticipants = [...new Set([...participants, userId])];

    if (type === "peer") {
        if (uniqueParticipants.length !== 2) {
            return res.status(400).json({ success: false, message: "Peer chat must have exactly 2 users" });
        }

        const existingChat = await Chat.findOne({
            type: "peer",
            participants: { $all: uniqueParticipants }
        });

        if (existingChat) {
            return res.status(200).json({
                success: true,
                chatId: existingChat.chatId,
                isNew: false
            });
        }
    }

    let groupName = null;
    let groupDescription = null;

    if (type === "group") {
        groupName = req.body?.groupName;
        groupDescription = req.body?.groupDescription;

        const { status, message } = RoomValidator.validateRoomData({
            name: groupName,
            description: groupDescription
        });

        if (!status) {
            return res.status(400).json({ success: false, message });
        }
    }

    const newChat = await Chat.create({
        chatId: "room_" + Date.now(),
        participants: uniqueParticipants,
        type,
        groupName: type === "group" ? groupName : null,
        groupDescription: type === "group" ? groupDescription : null
    });

    return res.status(201).json({
        success: true,
        chatId: newChat.chatId,
        isNew: true
    });

});

module.exports = {
    handleGetDirectChats,
    handleGetGroupChats,
    handleCreateNewChat
}
