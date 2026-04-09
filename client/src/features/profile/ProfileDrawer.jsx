import React from 'react'

export default function ProfileDrawer() {
    return (
        <div className="profile-drawer" id="profileDrawer">
            {/* <div className="drawer-header">
                    <button className="icon-btn" onclick="closeProfileDrawer()" style="background:rgba(255,255,255,0.2);color:#fff;">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <h3>Contact Info</h3>
                </div> */}
            <div className="drawer-header">
                <button className="icon-btn" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h3>Contact Info</h3>
            </div>
            <div className="drawer-body">
                <div className="profile-avatar-big" id="drawerAvatar">A</div>
                <div className="profile-name-big" id="drawerName">Name</div>
                <div className="profile-status-txt" id="drawerStatus">online</div>
                <div className="profile-row">
                    <i className="fas fa-phone"></i>
                    <div className="profile-row-info"><label>Phone</label><span id="drawerPhone">+91 98765 43210</span></div>
                </div>
                <div className="profile-row">
                    <i className="fas fa-circle-info"></i>
                    <div className="profile-row-info"><label>About</label><span id="drawerAbout">Hey there! I am using BlueChat.</span></div>
                </div>
                <div className="profile-row">
                    <i className="fas fa-image"></i>
                    <div className="profile-row-info"><label>Media, Links &amp; Docs</label><span>View all →</span></div>
                </div>
                {/* <div style="margin-top:20px;display:flex;flex-direction:column;gap:10px;">
                        <button onclick="blockContact()" style="width:100%;padding:12px;border:none;background:#fef2f2;color:#ef4444;border-radius:var(--radius-sm);font-family:var(--font-main);font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
                            <i className="fas fa-ban"></i> Block Contact
                        </button>
                        <button onclick="reportContact()" style="width:100%;padding:12px;border:none;background:var(--primary-xpale);color:var(--primary);border-radius:var(--radius-sm);font-family:var(--font-main);font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
                            <i className="fas fa-flag"></i> Report
                        </button>
                    </div> */}
                <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button style={{ width: "100%", padding: "12px", border: "none", background: "#fef2f2", color: "#ef4444", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-main)", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <i className="fas fa-ban"></i> Block Contact
                    </button>
                    <button style={{ width: "100%", padding: "12px", border: "none", background: "var(--primary-xpale)", color: "var(--primary)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-main)", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <i className="fas fa-flag"></i> Report
                    </button>
                </div>
            </div>
        </div>
    )
}
