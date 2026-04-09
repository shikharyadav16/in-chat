const Message = require('../../models/Message');
const Chat = require('../../models/Chat');
const { randomUUID } = require("crypto");

const saveMessages = async (message, type = "text") => {
    try {
        await Message.create({...message, type});

    } catch (err) {
        console.log("Error:", err);
    }
};

const updateChat = async (message) => {
    try {
        const updatedChat = await Chat.findOneAndUpdate(
            { chatId: message.roomId },
            {
                $set: {
                    lastMessage: message.encryptedPayload.cipherText,
                    lastMessageSender: message.senderId,
                    updatedAt: new Date()
                },
                $setOnInsert: {
                    chatId: message.roomId,
                    members: [message.senderId, message.receiverId],
                }
            },
            {
                upsert: true,
                returnDocument: "after",
                runValidators: true     
            }
        );

        return updatedChat;

    } catch (err) {
        console.error("Error updating chat:", err);
        throw err;
    }
};

function getMessageObject({ roomId, userId, message, replyTo = null, type = "text" }) {

    return {
        messageId: "msg_" + randomUUID(),
        roomId,
        senderId: userId,
        replyTo,
        encryptedPayload: {
            cipherText: message,
            noance: "default"
        },
        createdAt: (new Date().toISOString())
    };
}

async function updateMessageReadStatus({ userId, roomId }) {
    try {
        await Message.updateMany(
            {
                roomId,
                senderId: { $ne: userId },
                seenBy: { $ne: userId }
            },
            {
                $addToSet: { seenBy: userId }
            }
        );
    } catch (err) {
        console.log("Error:", err);
    }
}

module.exports = { saveMessages, updateChat, getMessageObject, updateMessageReadStatus };