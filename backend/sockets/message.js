const OnlineUser = require('../services/onlineUsers.service')();
const { saveMessages, updateChat, getMessageObject, updateMessageReadStatus } = require('./handlers/message.handler');

const socketMessageHandler = (io, socket) => {

    const userId = socket.user.userId;

    socket

        .on('message', async (data) => {  // data = { message (String), roomId (String), replyTo (String || null), type (text, image) }

            const requiredParams = { message: data.message, roomId: data.roomId, userId, replyTo: data.replyTo || null };
            const message = getMessageObject({ ...requiredParams });

            // adding  message into database
            await saveMessages(message, data.type);

            // Update the last message, last message sender in Chat
            const chat = await updateChat(message);
            let receiverId = null;
            if (chat.type === "peer") {
                receiverId = chat.participants.find(p => p !== userId);
            }


            if (receiverId) {
                
                // Send message to the receiver if online
                if (OnlineUser.has(receiverId)){
                    OnlineUser.get(receiverId).forEach(socketId => {
                        io.to(socketId).emit("message", message);
                    });
                }

            } else {
                
                // Send message to the online members of the room except Sender
                socket.to(message.roomId).emit("message", { message, type: data.type });
            }

            // Send message to the sender
            io.to(userId).emit("message-sent", { ...message, sendByMe: true, type: data.type });
        })

        // Accept the roomId to join the room when the user clicks on the chat
        .on('join-chat', ({ roomId }) => {
            socket.join(roomId);
        })

        // Remove the roomId from the socket when the user leaves the chat or goes to new chat
        .on('leave-chat', ({ roomId }) => {
            socket.leave(roomId);
        })

        .on("message-read", async (data) => { // data = { type (String), roomId (String) }

            const userId = socket.user.userId;
            
            // Update the message read status in the database
            await updateMessageReadStatus({ ...data, userId });
        })
}

module.exports = socketMessageHandler;