const socketMessageHandler = require('./message');
const OnlineUser = require('../services/onlineUsers.service')();

const socketHandler = (io) => {

    io.on('connection', (socket) => {

        socket.broadcast.emit("user-joins", socket.user.username);
        OnlineUser.add(socket.user.userId, socket.id)

        socketMessageHandler(io, socket);

        socket.on('disconnect', () => {
            // console.log('A user disconnected');
        });
        
    });

}

module.exports = socketHandler;