import { useContext } from 'react';
import { Navigate, useNavigate } from "react-router-dom";
import { useContactHeader } from './useContactHeader';
import ContactsContext from '../../context/ContactsContext';

function ContactHeader({ roomId }) {

    const navigate = useNavigate();
    const { contactList, loading: contactsLoading } = useContext(ContactsContext);
    const { contactData, loading, error, notFound } = useContactHeader({ contactList, roomId, contactsLoading });

    if (notFound) {
        return <Navigate to="/chat" replace />;
    }

    if (error) {
        return <div className="chat-header">Error loading contact</div>;
    }

    return (
        <div className="chat-header" id="chatHeader">

            <button
                className="icon-btn dark back-btn"
                onClick={() => navigate("/chat")}
            >
                <i className="fas fa-arrow-left"></i>
            </button>

            <div
                className="avatar-wrap"
                style={{ cursor: loading ? "not-allowed" : "pointer" }}
            >
                
                <div className="avatar">
<img src="https://i.pinimg.com/474x/0f/04/ac/0f04ac135a8d6db96514bd97261c1c97.jpg" alt="" />                </div>
                <div className="online-dot"></div>
            </div>

            <div
                className="chat-header-info"
                style={{ cursor: loading ? "not-allowed" : "pointer" }}
            >
                <div className="chat-header-name">
                    {loading
                        ? "Loading..."
                        // : contactData?.type === "peer"
                        //     ? contactData?.name
                        //     : contactData?.roomName
                        : contactData?.contactName
                            }
                </div>

                <div className="chat-header-status">
                    {contactData?.isOnline ? "online" : "offline"}
                </div>
            </div>

            <div className="chat-header-actions">
                <button className="icon-btn dark"><i className="ph-bold ph-video-camera"></i></button>
                <button className="icon-btn dark"><i className="ph-bold ph-phone"></i></button>
                <button className="icon-btn dark"><i className="ph-bold ph-magnifying-glass"></i></button>
                <button className="icon-btn dark"><i className="ph-bold ph-dots-three-outline-vertical"></i></button>
            </div>
        </div>
    );
}

export default ContactHeader;