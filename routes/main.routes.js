const express = require('express');
const { handleGetIndexPage } = require('../controllers/main.controller.js')
const router = express.Router();

router.get("/chat", handleGetIndexPage);

module.exports = router;