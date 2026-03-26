const User = require('../../models/User');
const Chat = require('../../models/Chat');
const asyncHandler = require('../../utils/asyncHandler');

const getRoomId = (userId, targetId) => {
    return userId > targetId
        ? "room_" + userId.slice(3) + targetId.slice(3)
        : "room_" + targetId.slice(3) + userId.slice(3);
};

const handleConnectContactRoom = asyncHandler(async ({ userId, socket }) => {

    if (!userId) return;
    socket.join(userId);

    const contacts = await Chat.find({  })

    if (!Array.isArray(contacts) || contacts.length === 0) {
        return;
    }

    for (const contact of contacts) {
        if (!contact?.userId) continue;
        const roomId = getRoomId(userId, contact.userId);
        socket.join(roomId);
    }
});

const handleLastSeen = asyncHandler(async({ userId }) => {
    const user = await User.findOne({ userId });

    const lastSeen = new Date();
    lastSeen.toISOString();
    user.lastSeen = lastSeen;
    await user.save();
});


module.exports = { handleLastSeen, handleConnectContactRoom };


