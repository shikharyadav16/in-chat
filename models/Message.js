const mongoose = require('mongoose');

const payloadSchema = new mongoose.Schema({
    cipherText: {
        type: String,
        required: true
    },
    noance: {
        type: String,
        required: true,
        default: "abc"
    }
}, { _id: false })

const messageSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    roomId: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["text"],
        default: "text"
    },
    encryptedPayload: { payloadSchema },
    replyTo: {
        type: String
    },
    // attachments: []
    seenBy: [{
        type: String
    }],
}, { timestamps: true });

const Message = mongoose.model("messages", messageSchema);

module.exports = Message;