import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Auth from './layouts/AuthLayout';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import Home from './pages/Home';
import DefaultChatArea from './features/chat/DefaultChatArea';
import ChatArea from './features/chat/ChatArea';
import { initSocket, connectSocket, getSocket } from './app/socket';
import { SocketContext } from "./context/SocketContext"
import UserContext from "./context/UserContext";
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [socket, setSocket] = useState(null)
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:3000/me", {
          credentials: "include"
        });

        const data = await res.json()
        if (res.ok) {
          setIsAuthenticated(res.ok);
          setUser(data)
        }

      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("Initializing socket")
      const socketInstance = initSocket();
      connectSocket();
      setSocket(socketInstance);
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [isAuthenticated]);

  if (loading) return <div>Loading...</div>;

  return (
    <UserContext.Provider value={user}>
        <SocketContext.Provider value={socket}>
          <Routes>
            <Route
              path='/auth'
              element={
                <Auth
                  setIsAuthenticated={setIsAuthenticated}
                  isAuthenticated={isAuthenticated}
                />
              }
            >
              <Route index element={<Navigate to="login" />} />
              <Route path='login' element={<Login />} />
              <Route path='signup' element={<Signup />} />
            </Route>

            <Route
              path='/chat'
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Home />
                </ProtectedRoute>
              }
            >
              <Route index element={<DefaultChatArea />} />
              <Route path=':roomId' element={<ChatArea />} />
            </Route>

            <Route path='*' element={<Navigate to="/auth/login" />} />
          </Routes>
        </SocketContext.Provider>
    </UserContext.Provider>
  );
}

export default App;