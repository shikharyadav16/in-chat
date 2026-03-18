const socketMessageHandler = require('./message');

const socketHandler = (io) => {

    io.on('connection', (socket) => {

        socket.broadcast.emit("user-joins", socket.id);

        socketMessageHandler(io, socket);

        socket.on('disconnect', () => {
            // console.log('A user disconnected');
        });
        
    });

}

module.exports = socketHandler;