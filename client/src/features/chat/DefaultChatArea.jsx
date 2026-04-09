export default function DefaultChatArea() {
    return (
        <div className="chat-welcome" id="chatWelcome">
            <div className="welcome-icon"><i className="ph-bold ph-chat-teardrop-dots"></i></div>
            <h2>InChat Web</h2>
            <p>Send and receive messages without keeping your phone online.<br />Use InChat on up to 4 linked devices.</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <div style={{ background: "var(--primary-pale)", color: "var(--primary)", padding: "8px 18px", borderRadius: "99px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}><i style={{ fontSize: "20px" }} className="ph-bold ph-shield-check"></i> End-to-end encrypted</div>
            </div>
        </div>
    )
}
