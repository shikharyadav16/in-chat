const express = require('express');
const router = express.router();

const { handleGetContacts } = require('../controllers/contact.controller')

router
    .post("/contacts", handleGetContacts);

module.exports = router;