const OnlineUser = require('../services/onlineUsers.service')();
const saveMessages = require('./handlers/message.handler');

const socketMessageHandler = (io, socket) => {

    socket
    .on('message', (data) => {

        if (OnlineUser.has(data.userId)) {
            OnlineUser.get(data.userId).forEach(socketId => {
                io.to(socketId).emit('message', { username: socket.user.username, message: data.message });
            });   
        }
        
        if (OnlineUser.has(socket.user.userId)) {
            OnlineUser.get(socket.user.userId).forEach(socketId => {
                io.to(socketId).emit('message_sent', { username: socket.user.username, message: data.message })
            })
        }

        // adding  message into database

        // saveMessages({ message: data.message, roomId:  })

    })
    

}

module.exports = socketMessageHandler;