function SearchResult({ searchList, hidden }) {
  return (
    <div className={`page ${hidden ? 'hidden' : ''}`} id="page-chats">
      <div className="search-list">
        <div className="section-label">Chat</div>
        {searchList.contacts.map(contact => (
          <ContactItem
            key={contact.roomId}
            type={contact.type}
            roomName={contact.roomName || "Unnamed Room"}
            roomId={contact.roomId}
            name={contact.name || "Unknown"}
            lastMsg={contact.lastMessage}
          />
        ))}

        <div className="section-label">New Chat</div>
        {searchList.nonContacts.map(contact => (
          <ContactItem
            key={contact.roomId}
            type={contact.type}
            roomName={contact.roomName || "Unnamed Room"}
            roomId={contact.roomId}
            name={contact.name || "Unknown"}
            lastMsg={contact.lastMessage}
          />
        ))}

      </div>
    </div>
  )
}

export default SearchResult