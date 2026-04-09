import { useEffect, useState, useContext } from "react";

export const useMessages = (roomId, skip = 0) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      setLoading(true);

      try {
        const res = await fetch(`http://localhost:3000/messages/${roomId}/?query=${skip}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [roomId, skip]);

  return { messages, setMessages, loading };
};