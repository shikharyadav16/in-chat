const onlineUsers = new Map();

function OnlineUser() {

    function get(userId) {
        return onlineUsers.get(userId) || null;
    }

    function add(userId, socketId) {
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }

        onlineUsers.get(userId).add(socketId);
    }

    function remove(userId, socketId) {
        const userSockets = onlineUsers.get(userId);

        if (!userSockets) return;

        userSockets.delete(socketId);

        if (userSockets.size === 0) {
            onlineUsers.delete(userId);
        }
    }

    function getAll() {
        return onlineUsers;
    }

    return { add, get, remove, getAll };
}

module.exports = OnlineUser;