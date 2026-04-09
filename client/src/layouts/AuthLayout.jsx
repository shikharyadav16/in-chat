import "../styles/auth.css";
import { Outlet, Navigate } from "react-router-dom";

function Auth({ setIsAuthenticated, isAuthenticated = false }) {

  if (isAuthenticated){
    console.log("Already authenticated, Redirecting")
    return <Navigate to="/chat" replace />
  }
  
  return (
    <div className="container">
      <div className="img-section"></div>
      <div className="form-section">
        <Outlet context={{setIsAuthenticated}} />
      </div>
    </div>
  )
}

export default Auth;