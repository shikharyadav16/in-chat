// const Chat = require("../models/Chat");
// const User = require('../models/User');
const Message = require("../models/Message")
const getRoomId = require("../utils/getRoomId");
const asyncHandler = require("../utils/asyncHandler");

const handleGetContactMessages = asyncHandler(async (req, res) => {
    const { contactId, skip } = req.user;
    const limit = 50;

    const userId = req.user.userId;
    const roomId = getRoomId({ userId, targetId: contactId });

    const messages = await Message.find({ roomId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    
    return res.status(200).json({ success: true, messages: messages.reverse() })
});