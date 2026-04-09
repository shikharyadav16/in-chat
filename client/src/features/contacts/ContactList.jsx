import { useContext } from 'react';
import ContactItem from './ContactItem';
import ContactsContext from '../../context/ContactsContext';

function ContactList({ hidden }) {

    const { contactList } = useContext(ContactsContext)

    return (
        <div className={`page ${hidden ? 'hidden' : ''}`} id="page-chats">
            <div className="contacts-list" id="contactsList">
                <div className="section-label">Recent</div>
                {contactList.map(contact => (
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

export default ContactList