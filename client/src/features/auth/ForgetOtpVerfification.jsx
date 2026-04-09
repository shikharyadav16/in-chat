import { useState, useRef, useEffect } from "react";
import "../../styles/otp-verification.css";

export default function ForgetOtpVerification({ setOpen, setNewPassOpen, open, email }) {

    const [code, setCode] = useState(Array(6).fill(""));
    const [status, setStatus] = useState("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [timer, setTimer] = useState(0);

    const inputRefs = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
            startTimer();
        } else {
            resetAll();
        }

        return () => clearInterval(timerRef.current);
    }, [open]);

    const startTimer = () => {
        setTimer(30);
        clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimer(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
    };

    const resetAll = () => {
        setCode(Array(6).fill(""));
        setStatus("idle");
        setErrorMsg("");
        clearInterval(timerRef.current);
    };

    const handleChange = (i, val) => {
        if (!/^\d*$/.test(val)) return;

        const digit = val.slice(-1);
        const next = [...code];
        next[i] = digit;

        setCode(next);
        setStatus("idle");
        setErrorMsg("");

        if (digit && i < 5) {
            inputRefs.current[i + 1]?.focus();
        }
    };

    const handleKeyDown = (i, e) => {
        if (e.key === "Backspace") {
            if (code[i]) {
                const next = [...code];
                next[i] = "";
                setCode(next);
            } else if (i > 0) {
                inputRefs.current[i - 1]?.focus();
            }
        }

        if (e.key === "ArrowLeft" && i > 0)
            inputRefs.current[i - 1]?.focus();

        if (e.key === "ArrowRight" && i < 5)
            inputRefs.current[i + 1]?.focus();

        if (e.key === "Enter") handleSubmit();
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;

        e.preventDefault();

        const next = Array(6).fill("");
        pasted.split("").forEach((d, i) => (next[i] = d));

        setCode(next);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleSubmit = async () => {
        const full = code.join("");

        if (full.length < 6) {
            setStatus("error");
            setErrorMsg("Please enter all 6 digits.");
            return;
        }

        setStatus("loading");

        try {
            const res = await fetch("http://localhost:3000/verify-reset-otp", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    otp: full
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus("error");
                setErrorMsg(data.message || "Invalid OTP");
                setCode(Array(6).fill(""));
                inputRefs.current[0]?.focus();
                return;
            }

            setStatus("success");
            setErrorMsg("");
            setNewPassOpen(true);
            setOpen(false);

        } catch (err) {
            console.error(err);
            setStatus("error");
            setErrorMsg("Server error. Try again.");
        }
    };

    const handleResend = async () => {
        try {
            await fetch("http://localhost:3000/resend-otp", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            resetAll();
            startTimer();
            inputRefs.current[0]?.focus();

        } catch {
            setErrorMsg("Failed to resend OTP");
        }
    };

    const getInputClass = (i) => {
        let cls = "otp-input";

        if (status === "error") return cls + " error";
        if (status === "success") return cls + " success";

        if (code[i]) cls += " filled";
        return cls;
    };

    const isFull = code.every(d => d !== "");

    return (
        <>
            {open && (
                <div
                    className="overlay-backdrop"
                    onClick={(e) => e.target === e.currentTarget && setOpen(false)}
                >
                    <div className="overlay-card">
                        <button className="close-btn" onClick={() => setOpen(false)}>✕</button>

                        {/* <div className="badge">
                            <span className="badge-dot" />
                            Verification Required
                        </div> */}

                        <h2 className="overlay-title">Check your inbox</h2>

                        <p className="overlay-subtitle">
                            We sent a 6-digit code to <strong>{email}</strong>
                        </p>

                        <div className="otp-row" onPaste={handlePaste}>
                            {code.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => inputRefs.current[i] = el}
                                    className={getInputClass(i)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    disabled={status === "loading" || status === "success"}
                                />
                            ))}
                        </div>

                        <div className="error-msg">{errorMsg}</div>

                        <button
                        type="button"
                            className={`submit-btn ${status === "success" ? "success-state" : ""}`}
                            onClick={handleSubmit}
                            disabled={!isFull || status === "loading" || status === "success"}
                        >
                            {status === "loading"
                                ? "Verifying..."
                                : status === "success"
                                    ? "✓ Verified!"
                                    : "Verify Code"}
                        </button>

                        <div className="resend-row">
                            Didn't get it?
                            {timer > 0 ? (
                                <span className="timer">Resend in {timer}s</span>
                            ) : (
                                <button className="resend-btn" type="button" onClick={handleResend}>
                                    Resend code
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}