import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ForgetOtpVerification from './ForgetOtpVerfification';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NewPassword from './NewPassword';

function Login() {
    const { setIsAuthenticated } = useOutletContext()
    // const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("yadavshikhar49@gmail.com");
    const [pass, setPass] = useState("secure@123");
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [newPassOpen, setNewPassOpen] = useState(false);

    function checkDetails() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const trimmedEmail = email.trim();
        const trimmedPass = pass.trim();

        if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
            alert("Invalid email");
            return;
        }

        if (!trimmedPass || trimmedPass.length < 8) {
            alert("Invalid password");
            return;
        }

        handleSubmitDetails({
            email: trimmedEmail,
            password: trimmedPass,
            remember
        });
    }

    function checkResetDetails() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const trimmedEmail = email.trim();

        if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
            alert("Invalid email");
            return;
        }

        handleResetOtp({
            email: trimmedEmail
        });
    }

    async function handleSubmitDetails(payload) {
        if (loading) return;

        setLoading(true);
        try {
            console.log("Login payload:", payload);

            const res = await fetch("http://localhost:3000/login", {
                credentials: "include",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) return alert("Invalid Credentials:", data.message);
            else {
                localStorage.setItem('access-token', data.token)
                setIsAuthenticated(true);
            } 

        } catch (err) {
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleResetOtp(payload) {

        try {
            const res = await fetch("http://localhost:3000/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) return alert("Invalid email:", data.message);
            else {
                alert("OTP sent to your email if it exists in our system.");
                setOpen(true);
            }

        } catch (err) {
            console.error("Reset OTP error:", err);
        }
    }

    return (
        <div className="form-wrapper">

            <form onSubmit={(e) => {
                e.preventDefault();
                checkDetails();
            }}>

                <div className="header">
                    <div className="title">Welcome Back</div>
                    <div className="subtitle">Login to access your account</div>
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
                        placeholder="*******"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                    />
                </div>

                <div className="remember">
                    <label>
                        <input 
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        {" "}Remember me
                    </label>

                    <div style={{cursor: "pointer"}} onClick={() => {checkResetDetails()}}>Forgot?</div>
                </div>

                <ForgetOtpVerification open={open} setOpen={setOpen} email={email} setNewPassOpen={setNewPassOpen} />
                <NewPassword open={newPassOpen} setNewPassOpen={setNewPassOpen} setIsAuthenticated={setIsAuthenticated} email={email} />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging In..." : "Log In"}
                </button>

                <div className="divider">
                    <hr /><p>Or Sign In With</p><hr />
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
                    Don't have an account? <Link to="/auth/signup">Sign up</Link>
                </div>

            </form>

        </div>
    )
}

export default Login