const express = require('express');
const router = express.Router();

const { handleGetDirectChats, handleGetGroupChats, handleCreateNewChat } = require('../controllers/chat.controller');

router
    .get("/chats/direct/:userId", handleGetDirectChats)
    .get("/chats/group/:roomId", handleGetGroupChats);

router
    .post("/chats/create", handleCreateNewChat);

module.exports = router;

