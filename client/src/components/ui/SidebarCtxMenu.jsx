import React, { forwardRef } from "react";

const SidebarCtxMenu = forwardRef(({ hidden }, ref) => {
    return (
        <div ref={ref} className={`ctx-menu ${hidden ? "ctx-hidden" : ""}`} id="sidebarMenu">
            <div className="ctx-item"><i className="ph-bold ph-users"></i> New Group</div>
            <div className="ctx-item"><i className="ph-bold ph-star"></i> Starred Messages</div>
            <div className="ctx-item"><i className="ph-bold ph-archive"></i> Archived Chats</div>
            <div className="ctx-item"><i className="ph-bold ph-gear-six"></i> Settings</div>
            <div className="ctx-item"><i className="ph-bold ph-question"></i> Help</div>
            <div className="ctx-item danger"><i className="ph-bold ph-sign-out"></i> Log out</div>
        </div>
    );
});

export default SidebarCtxMenu;