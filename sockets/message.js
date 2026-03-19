const OnlineUser = require('../services/onlineUsers.service')();

const socketMessageHandler = (io, socket) => {

    socket.on('message', (message) => {
        OnlineUser.get(socket.user.userId).forEach(socketId => {
            io.to(socketId).emit('message', { username: socket.user.username, message });
        });
    })

}

module.exports = socketMessageHandler;