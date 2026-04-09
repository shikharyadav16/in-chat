// const Chat = require("../models/Chat");
// const User = require('../models/User');
const Message = require("../models/Message")
// const getLocalDate = require("../utils/getLocalDate")
const asyncHandler = require("../utils/asyncHandler");

const handleGetChatMessages = asyncHandler(async (req, res) => {

    const { userId } = req.user;
    const { roomId } = req.params;
    const skip = parseInt(req.query.skip) || 0;

    const limit = 50;

    let messages = await Message.find({ roomId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    messages = messages.map(message => ({
        ...message,
        sendByMe: message.senderId === userId,
    }));

    return res.status(200).json({ success: true, messages: messages.reverse() })
});

module.exports = { handleGetChatMessages }