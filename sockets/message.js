const OnlineUser = require('../services/onlineUsers.service')();

const socketMessageHandler = (io, socket) => {

    socket
    .on('message', (data) => {
        OnlineUser.get(data.userId).forEach(socketId => {
            io.to(socketId).emit('message', { username: socket.user.username, message: data.message });
        });
        OnlineUser.get(socket.user.userId).forEach(socketId => {
            io.to(socketId).emit('message', { username: socket.user.username, message: data.message })
        })

    })

}

module.exports = socketMessageHandler;