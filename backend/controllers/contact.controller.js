const User = require('../models/User');
const Chat = require('../models/Chat');
const asyncHandler = require('../utils/asyncHandler');

const handleGetContacts = asyncHandler(async (req, res) => {

    // When user clicks on the contacts tab,
    // we return the list of contacts with their chatId if the chat exists.

    const userId = req.user.userId;

    const chats = await Chat.find({
        participants: userId,
    }).sort({ updatedAt: -1 });

    const user = await User.findOne({ userId }).select("contacts");
    const savedContacts = user?.contacts || [];

    const savedContactsMap = new Map();
    savedContacts.forEach(c => {
        savedContactsMap.set(c.userId, c.name);
    });

    const contactIdsSet = new Set();
    const peerChatMap = new Map();
    const finalChats = [];

    for (const chat of chats) {

        if (chat.type === "group") {
            finalChats.push({
                roomId: chat.chatId,
                type: "group",
                name: chat.groupName || "Unnamed Group",
                participants: chat.participants,
                sentBy: chat.lastMessageSender || null,
                lastMessage: chat.lastMessage || "",
                lastMessageTime: chat.updatedAt || null
            });
            continue;
        }

        const otherUser = chat.participants.find(id => id !== userId);

        if (otherUser) {
            contactIdsSet.add(otherUser);

            if (!peerChatMap.has(otherUser)) {
                peerChatMap.set(otherUser, {
                    roomId: chat.chatId,
                    contactId: otherUser,
                    type: "peer",
                    sentBy: chat.lastMessageSender || null,
                    lastMessage: chat.lastMessage || "",
                    lastMessageTime: chat.updatedAt || null
                });
            }
        }
    }

    const users = await User.find({
        userId: { $in: [...contactIdsSet] }
    }).select("userId email username");

    const userMap = new Map();
    users.forEach(u => userMap.set(u.userId, u));

    for (const [id, chatInfo] of peerChatMap.entries()) {
        const user = userMap.get(id);

        finalChats.push({
            ...chatInfo,
            email: user?.email || null,

            name:
                savedContactsMap.get(id) ||  
                user?.username ||           
                "Unknown User"              
        });
    }

    finalChats.sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    return res.status(200).json({
        success: true,
        chats: finalChats
    });
});

const handleGetNewContact = asyncHandler(async (req, res) => {

    // When user types in the search box to add a new contact,
    // we return the list of users matching the query.

    const { query } = req.query;

    if (!query || !query.trim()) {
        return res.status(400).json({ success: false, message: "Query required" });
    }

    const searchRegex = new RegExp(`^${query}`, "i");
    
    const users = await User.find({
        $or: [
            { username: searchRegex },
            { email: searchRegex }
        ]
    })
        .select("userId username email")
        .limit(10);

    const user = await User.findOne({ userId: req.user.userId }).select("contacts");
    const savedContacts = user?.contacts || [];
    const savedContactIds = new Set(savedContacts.map(c => c.userId));

    let contactList = {
        contacts: users.filter(u => savedContactIds.has(u.userId)),
        nonContacts: users.filter(u => !savedContactIds.has(u.userId))
    }

    contactList.contacts.forEach(c => {
        c.name = savedContacts.find(sc => sc.userId === c.userId)?.name || c.username;
    });

    console.log("Search results for query:", query, contactList);

    return res.json({ success: true, users: contactList });
});


module.exports = { handleGetContacts, handleGetNewContact }