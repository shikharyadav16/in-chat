import { useState } from 'react'
import { Link, useLocation, useOutletContext } from 'react-router-dom'
import OtpVerification from "./OtpVerification";

export default function Signup() {
    const location = useLocation();
    const { setIsAuthenticated } = useOutletContext();

    const [name, setName] = useState("Shikhar Yadav");
    const [email, setEmail] = useState("2k23.aids2310809@gmail.com");
    const [pass, setPass] = useState("secure@123");
    const [isChecked, setIsChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);


    function checkDetails() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedPass = pass.trim();

        if (!trimmedName || trimmedName.length < 3) {
            alert("Invalid name");
            return;
        }

        if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
            alert("Invalid email");
            return;
        }

        if (!trimmedPass || trimmedPass.length < 8) {
            alert("Password must be at least 8 characters");
            return;
        }

        if (!isChecked) {
            alert("Please accept terms");
            return;
        }

        handleSubmitDetails({
            username: trimmedName,
            email: trimmedEmail,
            password: trimmedPass
        });
    }

    async function handleSubmitDetails(payload) {
        if (loading) return;

        setLoading(true);
        try {
            const res = await fetch("http://localhost:3000/signup", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            alert(data.message);
            setOpen(true);

        } catch (err) {
            console.error("Signup error:", err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="form-wrapper">

            <form onSubmit={(e) => {
                e.preventDefault();
                checkDetails();
            }}>

                <div className="header">
                    <div className="title">Create Account</div>
                    <div className="subtitle">Sign up to get started</div>
                </div>

                <div className="nav">
                    <Link
                        to="/auth/login"
                        className={location.pathname === "/auth/login" ? "active" : ""}
                    >
                        Log In
                    </Link>

                    <Link
                        to="/auth/signup"
                        className={location.pathname === "/auth/signup" ? "active" : ""}
                    >
                        Sign Up
                    </Link>
                </div>

                <OtpVerification open={open} setOpen={setOpen} email={email.trim()} setIsAuthenticated={setIsAuthenticated} />

                <div className="input-field">
                    <label>Name</label>
                    <input
                        type="text"
                        maxLength={60}
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="input-field">
                    <label>Email</label>
                    <input
                        type="email"
                        maxLength={120}
                        placeholder="xyz@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="input-field">
                    <label>Password</label>
                    <input
                        type="password"
                        maxLength={60}
                        placeholder="Create a password"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                    />
                </div>

                <div className="remember">
                    <label>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                        />
                        {" "}I agree to the terms
                    </label>

                    <Link to="/auth/login">Already?</Link>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Signing Up..." : "Sign Up"}
                </button>

                <div className="divider">
                    <hr /><p>Or Sign Up With</p><hr />
                </div>

                <div className="social">
                    <Link to="/">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" />
                        Google
                    </Link>

                    <Link to="/">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" />
                        Facebook
                    </Link>
                </div>

                <div className="footer">
                    Already have an account? <Link to="/auth/login">Log in</Link>
                </div>

            </form>

        </div>
    )
}