const User = require('../models/User');
const Chat = require('../models/Chat');
const asyncHandler = require('../../utils/asyncHandler');

const handleGetContacts = asyncHandler(async (req, res) => {

    const userId = req.user.userId;

    const chats = await Chat.find({
        participants: userId,
        type: "peer"
    }).sort({ updatedAt: -1 });

    const user = await User.findOne({ userId }).select("contacts");
    const savedContacts = user.contacts;

    const contactIdsSet = new Set();
    const chatMap = new Map();

    for (const chat of chats) {
        for (const id of chat.participants) {
            if (id !== userId) {
                contactIdsSet.add(id);

                chatMap.set(id, {
                    sentBy: chat.lastMessageSender || null,
                    lastMessage: chat.lastMessage || "",
                    lastMessageTime: chat.updatedAt || null
                });
            }
        }
    }

    const users = await User.find({
        userId: { $in: [...contactIdsSet] }
    }).select("userId email");

    const savedContactsMap = new Map();
    savedContacts.forEach(c => {
        savedContactsMap.set(c.userId, c.name);
    });

    const contacts = users.map(user => {
        const chatInfo = chatMap.get(user.userId) || {};

        return {
            contactId: user.userId,
            email: user.email,
            name: savedContactsMap.get(user.userId) || null,
            type: "peer",
            sentBy: chatInfo.sentBy,
            lastMessage: chatInfo.lastMessage,
            lastMessageTime: chatInfo.lastMessageTime,
        };
    });

    return res.status(200).json({ success: true, contacts });
});


module.exports = { handleGetContacts }