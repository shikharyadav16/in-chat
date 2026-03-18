require('dotenv').config();

const cookie = require('cookie');
const jwt = require("jsonwebtoken");
const User = require('../models/User')

const isSocketAuthenticated = async (socket, next) => {

    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = socket.handshake.auth?.token || cookies.token;

    if (!token) {
        return next(new Error("Unauthorized"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        // console.log(decoded)
        const user = await User.findOne({ userId: decoded.userId })
        socket.user = {...user}
        next();
    } catch (err) {
        next(new Error("Unauthorized"));
    }
};

module.exports = { isSocketAuthenticated };