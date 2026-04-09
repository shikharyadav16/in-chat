export default function updateContactList({ roomId, message, contactList }) {
    const index = contactList.findIndex(chat => chat.roomId === roomId);

    if (index === -1) {

        const newChat = {
            roomId,
            contactId: message.senderId,
            type: message.type || "peer",
            sentBy: message.senderId,
            lastMessage: message.encryptedPayload.cipherText,
            lastMessageTime: message.createdAt,
            name: message.name || "Unknown"
        };

        return [newChat, ...updateContactList];
    }

    const updatedChat = {
        ...contactList[index],
        lastMessage: message.encryptedPayload.cipherText,
        lastMessageTime: message.createdAt,
        sentBy: message.senderId
    };
    contactList.splice(index, 1);
    contactList.unshift(updatedChat);

    return [...contactList];
}

