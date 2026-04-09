import { useState, useContext, useEffect, useLayoutEffect, useRef } from 'react'
import { useOutletContext, useNavigate, useParams } from 'react-router-dom'
import MessageElement from './MessageElement';
import ContactHeader from '../contacts/ContactHeader';
import MessageInput from './MessageInput';
import AttachPanel from './AttachPanel';
import { useMessages } from './useMessages';
import { useLiveMessages } from './useLiveMessages';
import ContactsContext from '../../context/ContactsContext';

export default function ChatArea() {

    const { roomId } = useParams();
    const { contactList, setContactList } = useContext(ContactsContext);
    const [skip, setSkip] = useState(0);
    const { messages, setMessages, loading } = useMessages(roomId, skip);
    const { liveMessages } = useLiveMessages({ roomId, setContactList, contactList })

    const messagesEndRef = useRef(null);

    useLayoutEffect(() => {
        function scrollSmoothly() { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }
        function scroll() { messagesEndRef.current?.scrollIntoView(); }
        return liveMessages.length > 0 ? scrollSmoothly() : scroll();
    }, [liveMessages, messages]);

    return (
        <>
            {/* ------
        Header 
        ------ */}

            <ContactHeader roomId={roomId} />


            {/* -------
            Message Area
            ------- */}

            <div className="messages-area" id="messagesArea">
                {messages.map(msg => {
                    return <MessageElement key={msg.messageId} message={msg} />
                })}
                {liveMessages.map(msg => {
                    return <MessageElement key={msg.messageId} message={msg} />
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* <div className="reply-preview" id="replyPreview">
                <div className="reply-preview-content">
                    <div className="reply-preview-name" id="replyName">You</div>
                    <div className="reply-preview-text" id="replyText"></div>
                </div>
                <button className="icon-btn dark" style={{ width: "28px", height: "28px" }}><i className="fas fa-xmark"></i></button>
            </div> */}

            {/* ---------
                Input Area 
                --------- */}

            <MessageInput />


            {/* --------
                    Attach Panel 
                    --------- */}

                <AttachPanel />
        </>
    )
}
