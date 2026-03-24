const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({

    userId: {
        type: String,
        unique: true,
        required: true
    },

    name: {
        type: String,
        required: true
    }

}, { _id: false });


const userSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true,
        unique: true
    },

    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    contact: {
        type: String
    },

    avatar: {
        type: String,
        default: ""
    },

    contacts: [contactSchema],

    lastSeen: {
        type: Date,
        default: Date.now
    },

    lastSeenLogs: [ {
        type: Date,
        default: Date.now
    }],

    publicKey: {
        type: String,
        required: true
    }

}, { timestamps: true });


const User = mongoose.model("User", userSchema);
module.exports = User;