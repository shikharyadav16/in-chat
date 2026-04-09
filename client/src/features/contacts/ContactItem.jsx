import React from 'react'
import { useNavigate } from 'react-router-dom';


export default function ContactItem({ isActive, roomId, type, roomName, initials, status, name, lastMsg, time, unread }) {

    const navigate = useNavigate();

    return (
        // <div className={`contact-item ${isActive ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); openChat(id) }} onTouchEnd={(e) => { e.preventDefault(); openChat() }}>
        <div
            className="contact-item"
            onClick={() => { navigate(`/chat/${roomId}`); }}

        // onTouchEnd={() => navigate(`/chat/${contactId}`)}
        >
            <div className="avatar-wrap">
                <div className="avatar">
                    <img src="https://i.pinimg.com/474x/0f/04/ac/0f04ac135a8d6db96514bd97261c1c97.jpg" alt="" />
                    {/* {isGroup ? '<i class="fas fa-users" st6yle="font-size:18px;"></i>' : initials} */}
                </div>
                {/* {status === 'online' ? <div class="online-dot"></div> : ''} */}
            </div>
            <div className="contact-info">
                <div className="contact-name">{name}</div>
                <div className="contact-preview">
                    {/* {unread === 0 ? <i class="fas fa-check-double tick"></i> : ''} */}
                    {lastMsg}
                </div>
            </div>
            <div className="contact-meta">
                {/* <div class="contact-time${c.unread > 0 ? ' unread' : ''}">{time}</div> */}
                {/* {unread > 0 ? <div class="badge">{unread}</div> : ''} */}
            </div>
        </div>
    )
}
