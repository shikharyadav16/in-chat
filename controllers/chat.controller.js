const Chat = require("../models/Chat");
const User = require('../models/User');
const Message = require("../models/Message")
const getRoomId = require("../utils/getRoomId");
const asyncHandler = require("../utils/asyncHandler");

const handleGetContactMessages = asyncHandler((req, res) => {
    const { contactId } = req.user;
    const userId = req.user.userId;
    // const 

    const roomId = getRoomId({ userId, targetId: contactId });

    const Messages = await Message.find()

})