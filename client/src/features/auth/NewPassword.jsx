import { useState, useEffect, useRef } from "react";

function NewPassword({ open, setNewPassOpen, email }) {

    const [errorMsg, setErrorMsg] = useState("");
    const [newPass, setNewPass] = useState("");
    const [loading, setLoading] = useState(false);
    const newPassRef = useRef("");  

    const handleChange = (e) => {
        setNewPass(e.target.value);
        newPassRef.current = e.target.value;
        if (errorMsg) setErrorMsg(""); 
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter") handleSubmit(newPassRef.current);
        };

        if (open) {
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open]); 

    async function handleSubmit(passValue) {
        const password = typeof passValue === "string" ? passValue : newPass;

        if (loading) return;

        if (!password.trim() || password.trim().length < 8) {
            setErrorMsg("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        setErrorMsg("");

        try {
            const res = await fetch("http://localhost:3000/set-new-password", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword: password })
            });

            const data = await res.json();
            console.log(data)

            if (data.error || !res.ok) {
                setErrorMsg(data.error);
            } else {
                alert("Password reset successful! Please log in with your new password.");
                setNewPassOpen(false);
                setErrorMsg("")
                setNewPass("");       
                newPassRef.current = "";
            }
        } catch (err) {
            setErrorMsg("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (!open) return null;

    return (
        <div
            className="overlay-backdrop"
            onClick={(e) => e.target === e.currentTarget && setNewPassOpen(false)}
        >
            <div className="overlay-card">
                <button className="close-btn" onClick={() => setNewPassOpen(false)}>✕</button>

                <h2 className="overlay-title">Enter new password</h2>

                <p className="overlay-subtitle">
                    Enter a new password for <strong>{email}</strong>
                </p>

                {errorMsg && <div className="error-msg">{errorMsg}</div>}
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPass}
                    onChange={handleChange}
                    disabled={loading}
                    autoFocus
                />


                <button
                    className="submit-btn"
                    type="button"
                    onClick={() => handleSubmit(newPass)}
                    disabled={loading}
                    >
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </div>
        </div>
    );
}

export default NewPassword;