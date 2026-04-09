const express = require('express');
const router = express.Router();

const { handleGetChatMessages } = require('../controllers/message.controller');

router
    .get("/messages/:roomId", handleGetChatMessages);

module.exports = router;