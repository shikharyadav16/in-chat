const express = require('express');
const { handleGetIndexPage } = require('../controllers/main.controller.js')
const router = express.Router();

router.get("/", (req, res) => {
    return res.render("index.html");
});

module.exports = router;