const OnlineUser = require('../services/onlineUsers.service')();

const socketMessageHandler = (io, socket) => {

    socket
    .on('message', (data) => {

        if (OnlineUser.has(data.userId)) {
            console.log("yes he is online")
            OnlineUser.get(data.userId).forEach(socketId => {
                io.to(socketId).emit('message', { username: socket.user.username, message: data.message });
            });   
        }
        
        if (OnlineUser.has(socket.user.userId)) {
            OnlineUser.get(socket.user.userId).forEach(socketId => {
                io.to(socketId).emit('message_sent', { username: socket.user.username, message: data.message })
            })
        }

        // add message into database
        // Code------

    })
    

}

module.exports = socketMessageHandler;