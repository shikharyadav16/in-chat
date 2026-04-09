import { getSocket } from "../app/socket";

export const sendMessage = (message) => {
    try {
        const socket = getSocket();
        socket.emit("message", message);
    } catch (error) {
        console.warn("Socket not initialized, message not sent:", message);
    }
};

export const onMessageSent = (callback) => {
    try {
        const socket = getSocket();
        socket.on("message-sent", callback);
    } catch (error) {
        console.warn("Socket not initialized, cannot listen for message-sent events");
    }
}

export const onMessage = (callback) => {
    try {
        const socket = getSocket();
        socket.on("message", callback);
    } catch (error) {
        console.warn("Socket not initialized, cannot listen for message events");
    }
};