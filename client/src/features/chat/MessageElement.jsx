import React from 'react'

export default function MessageElement({ message, contactName = "Unknown" }) {

    if (message.type === "image") return (
        <div className={`message-row ${message.type}`} >
            <div className="message-bubble-wrap">
                {/* <div className="reaction-popup">
                    ${emojis.slice(0, 6).map(e => `<span className="reaction-emoji" onclick="react('${e}')">${e}</span>`).join('')}
                </div> */}
                <div className="message-bubble media-only" style={{ padding: "4px", overflow: "hidden" }}>
                    <div className="message-media" style={{ width: "200px", height: "150px" }}>
                        <img src="${message.image}" alt="media" loading="lazy" />
                        <div className="message-media-overlay">
                            <span className="message-time" style={{ color: "#fff", opacity: "1" }}>${message.time}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    if (message.type === "text") return (
        <>
            <div className={`msg-row ${message.sendByMe ? "out" : "in"}`}>
                <div className="msg-bubble-wrap">
                    <div className="msg-bubble" style={{marginBlock: '5px'}} >{message.encryptedPayload.cipherText}
                        <div className="msg-meta">
                            <span className="msg-time">{message.time}</span>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}
