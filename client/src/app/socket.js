import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
    if (!socket) {
        socket = io("http://localhost:3000", {
            withCredentials: true,
            autoConnect: false, 
            transports: ["websocket", "polling"],
            auth: { token: localStorage.getItem("access-token") }
        });

        socket.once("connect", () => {
            console.log("Socket connected!");
        });

        socket.once("disconnect", () => {
            console.log("Socket disconnected!");
        });
    }

    return socket;
}

export const connectSocket = () => {
    if (socket && !socket.connected) {
        console.log("Connecting to socket")
        socket.connect()
    }
}

export const disconnectSocket = () => {
    if (socket && socket.connected) {
        socket.disconnect();
    }
}

export const getSocket = () => {
    if (!socket) {
        throw new Error("Socket not initialized. Call initSocket() first.");
    }
    return socket;
};