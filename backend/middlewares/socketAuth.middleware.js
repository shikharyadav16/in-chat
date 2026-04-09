require('dotenv').config();

const cookie = require('cookie');
const jwt = require("jsonwebtoken");
const User = require('../models/User');

const isSocketAuthenticated = async (socket, next) => {
    try {
        const rawCookie = socket.handshake.headers?.cookie;
        const cookies = rawCookie ? cookie.parse(rawCookie) : {};

        const accessToken =
            socket.handshake.auth?.token ||
            cookies["access-token"] ||
            null;
        if (!accessToken) {
            return next(new Error("Unauthorized"));
        }

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

        const user = await User.findOne({ userId: decoded.userId });

        if (!user) {
            return next(new Error("Unauthorized"));
        }

        socket.user = {
            userId: user.userId,
            username: user.username,
            email: user.email
        };

        next();

    } catch (err) {
        console.error("❌ Socket auth error:", err.message);
        next(new Error("Unauthorized"));
    }
};

module.exports = { isSocketAuthenticated };