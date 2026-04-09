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

    type: {
        type: String,
        enum: ["peer", "group", "channel", "thread"],
        default: "peer"
    },

    groupName: {
        type: String,
        default: null
    },

    groupDescription: {
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