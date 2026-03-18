const socketMessageHandler = (io, socket) => {

    socket.on('message', () => {
        io.emit('message', );
    });

}

module.exports = socketMessageHandler;