const User = require('../models/User');

async function validateUserId(userId) {
    try {
        const exists = await User.exists({ userId });
        return !!exists;

    } catch (err) {
        console.log("Error:", err);
    }
}

module.exports = validateUserId;