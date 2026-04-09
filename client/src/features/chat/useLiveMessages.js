import { useEffect, useContext, useState } from "react";
import updateContactList from "./utils/updateContactList";
import { SocketContext } from "../../context/SocketContext";

export const useLiveMessages = ({ roomId, setContactList }) => {

    const [liveMessages, setLiveMessages] = useState([])
    const socket = useContext(SocketContext);

    useEffect(() => {
        if (!socket) return; 

        const handleIncomingMessage = (message) => {
            if (message.roomId !== roomId) return;
            setContactList(prev =>
                updateContactList({
                    roomId,
                    message,
                    contactList: prev
                })
            );

            setLiveMessages(prev => [...prev, message]);
        };

        const handleMessageSent = (message) => {
            if (message.roomId !== roomId) return;
            setContactList(prev =>
                updateContactList({
                    roomId,
                    message,
                    contactList: prev
                })
            );
            setLiveMessages(prev => [...prev, message]);
        };

        socket.on("message", handleIncomingMessage);
        socket.on("message-sent", handleMessageSent);

        return () => {
            socket.off("message", handleIncomingMessage);
            socket.off("message-sent", handleMessageSent);
        };
    }, [roomId, socket]); 


    return { liveMessages: liveMessages || [] }
}