const express = require('express');
const router = express.Router();

const { handleGetIndexPage } = require('../controllers/main.controller.js')

router.get("/chat", handleGetIndexPage);

module.exports = router;