import { useState } from "react";
import { sendMessage } from "../../services/socket.service";
import { getMessageObject } from "../../utils/getMessageObject";
import { useParams } from "react-router-dom";

function MessageInput() {

    const [messageInput, setMessageInput] = useState("");
    const { roomId } = useParams();

    function handleSendMessage() {
        const text = messageInput.trim();
        if (!text || text === "") return;

        const messageObj = getMessageObject({ text, roomId })
        sendMessage(messageObj)
        setMessageInput("")
    }
    

    return (
        <div className="input-area" id="inputArea">
            <div className="input-actions-left">
                <button className="icon-btn dark" title="Attach">
                    <i className="ph-bold ph-paperclip" style={{fontSize: "18px"}}></i>
                    {/* <i className="ph-bold ph-x" style={{fontSize: "18px"}}></i> */}
                </button>
            </div>
            <div className="input-box-wrap">
                {/* <span className="emoji-btn">😊</span> */}
                <textarea id="msgInput" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type a message..." rows="1" onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}></textarea>
            </div>
            <button className="send-btn" id="sendBtn" onClick={() => { handleSendMessage() }}>
                <i className="ph-bold ph-paper-plane-tilt"></i>
            </button>
            <button className="mic-btn" id="micBtn">
                <i className="ph-bold ph-microphone" style={{fontSize: "18px"}}></i>
                {/* <i className="ph-bold ph-microphone-slash"  style={{fontSize: "18px"}}></i> */}
            </button>
        </div>
    )
}

export default MessageInput