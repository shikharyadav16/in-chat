require('dotenv').config();
const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {

    const accesstoken = req?.cookies?.["access-token"];

    if (!accesstoken) {
        return res.status(401).json({ success: false, message: "Unauthorized token is required" });
    }

    try {
        const decoded = jwt.verify(accesstoken, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(403).json({ success: false, message: "Invalid token payload" });
        }
        req.user = decoded;
        next();

    } catch (err) {
        return res.status(403).json({ success:false, message: "Unauthorized! " });
    }

}

module.exports = { isAuthenticated }