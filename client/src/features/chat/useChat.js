import { useEffect, useState, useContext } from "react";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../../context/SocketContext";
import { useUser } from "../../context/UserContext";

export const useChat = () => {
  const socket = useContext(SocketContext);
  const { roomId } = useParams();

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handler = (message) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on("message", handler);
    return () => socket.off("message", handler);

  }, [socket, roomId]);

  return { messages, setMessages };
};