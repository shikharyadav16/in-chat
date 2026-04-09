import { useEffect, useState } from "react";

export const useContacts = () => {
  const [contactList, setContactList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("http://localhost:3000/contacts", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });

        const data = await res.json();

        if (res.ok) {
          setContactList(data.chats || []);
        } else {
          throw new Error(data.message || "Failed to load contacts");
        }
      } catch (err) {
        setError(err.message);
        setContactList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  return { contactList, setContactList, loading, error };
};