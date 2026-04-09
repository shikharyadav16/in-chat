import React from 'react'

function AttachPanel() {
    return (
        <div className="attach-panel" id="attachPanel">
            <div className="attach-item">
                <div className="attach-icon" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}><i className="fas fa-file-alt"></i></div>
                <div className="attach-label">Document</div>
            </div>
            <div className="attach-item">
                <div className="attach-icon" style={{ background: "linear-gradient(135deg,#ec4899,#f97316)" }}><i className="fas fa-camera"></i></div>
                <div className="attach-label">Camera</div>
            </div>
            <div className="attach-item">
                <div className="attach-icon" style={{ background: "linear-gradient(135deg,#22c55e,#10b981)" }}><i className="fas fa-image"></i></div>
                <div className="attach-label">Gallery</div>
            </div>
            <div className="attach-item">
                <div className="attach-icon" style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}><i className="fas fa-headphones"></i></div>
                <div className="attach-label">Audio</div>
            </div>
            <div className="attach-item">
                <div className="attach-icon" style={{ background: "linear-gradient(135deg,#06b6d4,#0ea5e9)" }}><i className="fas fa-location-dot"></i></div>
                <div className="attach-label">Location</div>
            </div>
            <div className="attach-item">
                <div className="attach-icon" style={{ background: "linear-gradient(135deg,#8b5cf6,#1a6cff)" }}><i className="fas fa-user"></i></div>
                <div className="attach-label">Contact</div>
            </div>
        </div>
    )
}

export default AttachPanel