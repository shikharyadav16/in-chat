const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    chatId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },

    participants: {
        type: [String],
        required: true
    },

    isGroup: {
        type: Boolean,
        default: false
    },

    groupName: {
        type: String,
        default: null
    },

    lastMessage: {
        type: String,
        default: null
    },

    lastMessageSender: {
        type: String,
        default: null
    }

}, { timestamps: true });

const Chat = mongoose.model("chats", chatSchema);

module.exports = Chat;