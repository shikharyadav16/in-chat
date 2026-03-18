const mongoose = require('mongoose');
const express = require('express');
const app = express();
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/chat-app').then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

User.deleteMany({}).then(() => {
    console.log('Cleared User collection');
});

app.listen(8000, () => {
    console.log('Server is running on port 3000');
});