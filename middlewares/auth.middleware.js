require('dotenv').config();
const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {

    const token = req?.cookies?.token;

    if (!token) {
        return res.status(401).json({status: false, message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(d)
        if (!decoded || !decoded.userId) {
            return res.status(401).json({status: false, message: "Invalid token payload" });
        }
        req.user = decoded;
        next();

    } catch (err) {
        return res.status(401).json({status:false, message: "Unauthorized" });
    }

}

module.exports = { isAuthenticated }