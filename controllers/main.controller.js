const asyncHandler = require("../utils/asyncHandler");
const User = require('../models/User');

const handleGetIndexPage = asyncHandler(async (req, res) => {

    const userId = req.user.userId;
    const user = await User.findOne({ userId });
    return res.status(200).json({ contacts: user.contacts || [], userId: user.userId })

});

module.exports = { handleGetIndexPage }