const User = require('../../models/User');
const asyncHandler = require('../../utils/asyncHandler');

const handleConnectContactRoom = asyncHandler(async ({ userId, socket }) => {

    if (!userId) return [];

    socket.join(userId);

    const chats = await Chat.find({
        participants: userId,
        type: "peer"
    }).sort({ updatedAt: -1 });

    if (!chats.length) return [];

    for (const chat of chats) {
        socket.join(chat.chatId);
    }

    return;
});


const handleLastSeen = asyncHandler(async({ userId }) => {
    const user = await User.findOne({ userId });
    const lastSeen = new Date();
    lastSeen.toISOString();
    user.lastSeen = lastSeen;
    await user.save();
});


module.exports = { handleLastSeen, handleConnectContactRoom };


