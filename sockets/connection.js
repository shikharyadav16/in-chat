const socketMessageHandler = require('./message');
const OnlineUser = require('../services/onlineUsers.service')();
const { handleLastSeen, handleConnectContactRoom } = require('./handlers/connection.handler');

const socketHandler = (io) => {

    io.on('connection', (socket) => {
        
        // Add into the online status
        OnlineUser.add(socket.user.userId, socket.id);

        // Connect with the contacts Room Id, personal Room
        handleConnectContactRoom({ userId: socket.user.userId, socket });

        // socket.broadcast.emit("user-joins", socket.user.username);
        console.log("User connected:", socket.id)
        
        socketMessageHandler(io, socket);
        
        socket.on('disconnect', () => {

            // Update the last seen of the user
            handleLastSeen({ userId: socket.user.userId })
            OnlineUser.remove(socket.user.userId, socket.id)
        });
        
    });

}

module.exports = socketHandler;