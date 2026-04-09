const express = require('express');
const router = express.Router();

const { handleGetContacts, handleGetNewContact } = require('../controllers/contact.controller')

router
    .get("/contacts", handleGetContacts)

router
    .get("/users/search", handleGetNewContact);

module.exports = router;