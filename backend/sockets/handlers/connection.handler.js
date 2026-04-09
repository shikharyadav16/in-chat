const User = require('../../models/User');
const Chat = require('../../models/Chat');
const getLocalDate = require('../../utils/getLocalDate');

const handleConnectContactRoom = async ({ userId, socket }) => {

    if (!userId) return;

    socket.join(userId);

    const chats = await Chat.find({
        participants: userId,
        type: "group"
    }).sort({ updatedAt: -1 });
    
    if (!chats.length) return;

    for (const chat of chats) {
        socket.join(chat.chatId);
    }

    return;
};

const handleGetLastSeen = async({ contactId }) => {
    const user = await User.findOne({ userId: contactId });
    return user.lastSeen;
};

const handleLastSeen = async({ userId }) => {
    const user = await User.findOne({ userId });
    const lastSeen = new Date();
    lastSeen.toISOString();
    user.lastSeen = lastSeen;
    await user.save();
};

module.exports = { handleLastSeen, handleConnectContactRoom, handleGetLastSeen };


