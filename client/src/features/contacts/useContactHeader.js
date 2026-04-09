import { useEffect, useState } from "react";

export const useContactHeader = ({contactList, roomId, contactsLoading}) => {
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  
  useEffect(() => {
    if (!roomId) {
      setNotFound(false);
      return;
    }

    if (contactsLoading) {
      setNotFound(false);
      return;
    }

    const contact = contactList.find(c => c.roomId === roomId);
    if (!contact) {
      setContactData(null);
      setError(null);
      setLoading(false);
      setNotFound(true);
      return;
    }

    setNotFound(false);

    let isMounted = true;
    
    const fetchContact = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`http://localhost:3000/chats/direct/${contact.contactId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch contact");
        }

        if (isMounted) {
          setContactData(data);
        }

      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
        console.error("Contact fetch error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchContact();

    return () => {
      isMounted = false;
    };
  }, [roomId, contactList, contactsLoading]);

  return { contactData, loading, error, notFound };
};