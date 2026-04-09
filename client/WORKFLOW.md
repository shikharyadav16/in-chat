# BlueChat - Project Workflow Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Data Flow & Workflow](#data-flow--workflow)
4. [Component Hierarchy](#component-hierarchy)
5. [Authentication Flow](#authentication-flow)
6. [Chat & Messaging Flow](#chat--messaging-flow)
7. [Socket.IO Integration](#socketio-integration)
8. [Context & State Management](#context--state-management)
9. [API Endpoints](#api-endpoints)
10. [Development Guide](#development-guide)
11. [File Structure](#file-structure)

---

## 🎯 Project Overview

**BlueChat** is a modern, real-time chat application built with cutting-edge web technologies. It provides:
- User authentication with OTP verification
- Real-time messaging via WebSockets
- Contact/Chat management
- Multi-device support
- End-to-end encrypted messaging
- WhatsApp-inspired UI/UX

**Tech Stack:**
- **Frontend:** React 19.2.4 + React Router v7
- **Real-time Communication:** Socket.IO Client 4.8.3
- **Build Tool:** Vite 8.0.1
- **State Management:** React Context API
- **Styling:** CSS3 with CSS Variables
- **Code Quality:** ESLint

---

## 🏗 Architecture Overview

### Architectural Pattern: Component-Based with Context API

```
┌─────────────────────────────────────────────────┐
│          Browser / Client Application            │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ┌────▼─────────┐       ┌──────▼──────┐
   │  React App   │       │  Socket.IO  │
   │  Component   │       │   Client    │
   │   Tree       │       │             │
   └────┬─────────┘       └──────┬──────┘
        │                         │
   ┌────▼──────────────────────────►──────┐
   │   Context API (Global State)         │
   │  ├─ UserContext                      │
   │  └─ SocketContext                    │
   └────────────────────────────────────────┘
        │
   ┌────▼────────────────────────────┐
   │    Routed Pages & Components     │
   │  ├─ Auth Layout                  │
   │  │  ├─ Login                     │
   │  │  └─ Signup                    │
   │  └─ Chat Layout                  │
   │     ├─ Contact List              │
   │     ├─ Chat Area                 │
   │     ├─ Message Display           │
   │     └─ Message Input             │
   └────┬────────────────────────────┘
        │
   ┌────▼──────────────────────────┐
   │    Backend API (REST)          │
   │   + WebSocket Connection       │
   │   (localhost:3000)             │
   └────────────────────────────────┘
```

---

## 📊 Data Flow & Workflow

### High-Level Data Flow

```
User Input (UI)
     │
     ▼
State Update (React State/Context)
     │
     ├──────────────────┬──────────────────┐
     │                  │                  │
     ▼                  ▼                  ▼
API Call (REST)    Socket Event        Re-render
     │              (WebSocket)         Components
     │                  │                  │
     ▼                  ▼                  ▼
Backend Service    Real-time Update   Visual Update
     │              (Server → Client)      │
     └──────────────┬──────────────────────┘
                    │
                    ▼
              Update UI/State
```

### Component Rendering Flow

```
main.jsx
  ├─ BrowserRouter (React Router Setup)
  │
  ├─ App.jsx (Root Component)
  │   ├─ Authentication Check
  │   ├─ State Management (isAuthenticated, userId)
  │   └─ Routes Definition
  │
  ├─ AuthLayout (Auth Routes)
  │   ├─ Login.jsx
  │   │   ├─ Email & Password Input
  │   │   ├─ Validation Logic
  │   │   ├─ API Call (/login)
  │   │   └─ Set isAuthenticated → true
  │   │
  │   └─ Signup.jsx
  │       ├─ Name + Email + Password Input
  │       ├─ Terms Acceptance
  │       ├─ API Call (/signup)
  │       ├─ OTP Verification
  │       └─ Set isAuthenticated → true
  │
  └─ ProtectedRoute (Protected Routes)
      └─ Home.jsx (Chat Layout)
          ├─ Sidebar (Contact List)
          │   ├─ ContactItem.jsx (for each contact)
          │   └─ Fetched from /contacts API
          │
          ├─ Main Chat Area (Outlet)
          │   ├─ ChatArea.jsx (when contact selected)
          │   │   ├─ Chat Header (Contact Info)
          │   │   ├─ Messages Display Area
          │   │   │   └─ MessageElement.jsx (for each message)
          │   │   │
          │   │   └─ MessageInput.jsx
          │   │       ├─ Text Input
          │   │       └─ Send Button
          │   │
          │   └─ DefaultChatArea.jsx (Welcome Screen)
          │       └─ Shows when no contact is selected
          │
          ├─ Socket Event Listeners
          │   ├─ "message" event → Update messages
          │   ├─ "disconnect" event → Handle disconnection
          │   └─ "connect" event → Re-establish connection
          │
          └─ Context Providers
              ├─ UserContext (userId from localStorage)
              └─ SocketContext (Socket.IO instance)
```

---

## 🎨 Component Hierarchy

```
App
├── AuthLayout
│   ├── Login
│   ├── Signup
│   └── OtpVerification
│
├── ProtectedRoute
│   └── Home
│       ├── Sidebar
│       │   ├── SidebarHeader
│       │   ├── SearchBox
│       │   └── ContactList
│       │       └── ContactItem (×n)
│       │
│       └── Outlet (Dynamic)
│           ├── ChatArea
│           │   ├── ChatHeader
│           │   │   ├── Contact Avatar
│           │   │   ├── Contact Name & Status
│           │   │   └── Action Buttons
│           │   │
│           │   ├── MessagesArea
│           │   │   └── MessageElement (×n)
│           │   │
│           │   ├── ReplyPreview
│           │   │
│           │   ├── MessageInput
│           │   │   ├─ TextArea
│           │   │   ├─ Attachment Button
│           │   │   └─ Send Button
│           │   │
│           │   └── AttachmentPanel
│           │
│           └── DefaultChatArea (Welcome Screen)
```

---

## 🔐 Authentication Flow

### Login Flow
```
┌────────────────────────────────────────────────────────┐
│                    User Login Page                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Step 1: User enters email & password             │  │
│  │ ✓ Email validation (regex)                       │  │
│  │ ✓ Password length check (min 8 chars)            │  │
│  └────────────┬─────────────────────────────────────┘  │
│               │                                         │
│  ┌────────────▼─────────────────────────────────────┐  │
│  │ Step 2: Submit form (POST /login)                │  │
│  │ Headers: Content-Type: application/json          │  │
│  │ Body: { email, password, remember }             │  │
│  │ Credentials: include (for cookies)               │  │
│  └────────────┬─────────────────────────────────────┘  │
│               │                                         │
│  ┌────────────▼─────────────────────────────────────┐  │
│  │ Step 3: Backend validates credentials           │  │
│  │ Response: { userId, message, token }            │  │
│  └────────────┬─────────────────────────────────────┘  │
│               │                                         │
│  ┌────────────▼─────────────────────────────────────┐  │
│  │ Step 4: Frontend updates state                   │  │
│  │ ✓ localStorage.setItem("userId", userId)        │  │
│  │ ✓ setIsAuthenticated(true)                       │  │
│  └────────────┬─────────────────────────────────────┘  │
│               │                                         │
│  ┌────────────▼─────────────────────────────────────┐  │
│  │ Step 5: Redirect to /chat                        │  │
│  │ ✓ ProtectedRoute grants access                   │  │
│  │ ✓ Home component mounts                          │  │
│  │ ✓ Fetch contacts & initialize socket             │  │
│  └─────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Signup Flow
```
┌────────────────────────────────────────────────────────┐
│                  User Signup Page                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Step 1: User enters name, email & password       │  │
│  │ ✓ Name validation (min 3 chars)                  │  │
│  │ ✓ Email validation (regex)                       │  │
│  │ ✓ Password validation (min 8 chars)              │  │
│  │ ✓ Terms & conditions checkbox                    │  │
│  └────────────┬─────────────────────────────────────┘  │
│               │                                         │
│  ┌────────────▼─────────────────────────────────────┐  │
│  │ Step 2: Submit form (POST /signup)               │  │
│  │ Body: { username, email, password }             │  │
│  └────────────┬─────────────────────────────────────┘  │
│               │                                         │
│  ┌────────────▼─────────────────────────────────────┐  │
│  │ Step 3: Backend creates user account            │  │
│  │ Response: { message, success }                  │  │
│  └────────────┬─────────────────────────────────────┘  │
│               │                                         │
│  ┌────────────▼─────────────────────────────────────┐  │
│  │ Step 4: Show OTP Verification Modal             │  │
│  │ setOpen(true)                                    │  │
│  └────────────┬─────────────────────────────────────┘  │
│               │                                         │
│  ┌────────────▼─────────────────────────────────────┐  │
│  │ Step 5: User receives OTP via email             │  │
│  │ Enters 6-digit code                              │  │
│  │ API verification (POST /verify-otp)             │  │
│  └────────────┬─────────────────────────────────────┘  │
│               │                                         │
│  ┌────────────▼─────────────────────────────────────┐  │
│  │ Step 6: Account verified                         │  │
│  │ ✓ setIsAuthenticated(true)                       │  │
│  │ ✓ localStorage.setItem("userId", userId)        │  │
│  │ ✓ Redirect to /chat                              │  │
│  └─────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Authentication Check on App Mount
```
App.jsx useEffect
  │
  ├─ Check localStorage for "userId"
  │
  └─ If userId exists:
      └─ Fetch GET /me (with credentials)
         ├─ Success (200) → isAuthenticated = true
         └─ Failure (401) → isAuthenticated = false
                            remove userId from localStorage
```

---

## 💬 Chat & Messaging Flow

### Contact List Fetch
```
Home.jsx mounted
  │
  └─ useEffect (empty dependency array)
      │
      └─ fetchContacts()
          │
          ├─ POST /contacts
          │  ├─ Headers: Content-Type: application/json
          │  └─ Credentials: include
          │
          ├─ Response: { chats: [...] }
          │  └─ Each chat object:
          │     {
          │       roomId: string,
          │       name: string,
          │       type: "peer" | "group",
          │       lastMessage: string,
          │       lastMessageTime: ISO8601,
          │       unreadCount: number
          │     }
          │
          └─ setState: setContactList(chats)
```

### Message Fetch on Contact Selection
```
When roomId changes (/chat/:roomId)
  │
  └─ useEffect (dependency: roomId)
      │
      ├─ POST /messages
      │  ├─ Body: { roomId, skip: 0 }
      │  └─ Credentials: include
      │
      ├─ Response: { messages: [...] }
      │  └─ Each message object:
      │     {
      │       messageId: string,
      │       senderId: string,
      │       encryptedPayload: { cipherText: string },
      │       time: ISO8601,
      │       type: "text" | "image",
      │       read: boolean
      │     }
      │
      └─ setState: setMessages(messages)
```

### Send Message Flow
```
User types message & clicks send
  │
  └─ MessageInput.jsx
      │
      └─ sendMessage()
          │
          ├─ Validate input (non-empty)
          │
          └─ socket.emit("message", {
                 roomId,
                 message,
                 timestamp,
                 senderId
             })
             │
             └─ Real-time WebSocket transmission
                 │
                 ├─ Backend receives & encrypts
                 │
                 ├─ Broadcasts to recipients
                 │
                 └─ Recipient's socket listener
                     │
                     └─ socket.on("message", (msg) => {
                         message.sendByMe = false;
                         setMessages([...prev, msg])
                     })
                         │
                         └─ MessageElement.jsx renders message
```

### Real-Time Message Loop
```
Socket Event Listeners (Home.jsx)
  │
  ├─ socket.on("message", (message) => {
  │     if (message.senderId === roomId) {
  │       message.sendByMe = false;
  │   } else if (message.senderId === userId) {
  │       message.sendByMe = true;
  │     }
  │     setMessages(prev => [...prev, message])
  │  })
  │
  └─ socket.off("message", handler) [on unmount]
```

---

## 🔌 Socket.IO Integration

### Socket Initialization (app/socket.js)
```javascript
Singleton Pattern:
├─ initSocket()
│  └─ Creates single socket instance if not exists
│     io("http://localhost:3000", {
│       withCredentials: true,
│       autoConnect: false  // manual connection
│     })
│
├─ connectSocket()
│  └─ Manually connect if not already connected
│
├─ disconnectSocket()
│  └─ Gracefully disconnect
│
└─ getSocket()
   └─ Retrieve initialized socket instance
```

### Socket Context (context/SocketContext.js)
```javascript
export const SocketContext = createContext(null);

// Usage in App.jsx:
<SocketContext.Provider value={socket}>
  <Home />
</SocketContext.Provider>

// Usage in components:
const socket = useContext(SocketContext);
```

### Socket Events
```
Client → Server:
├─ "message" 
│  └─ Payload: { roomId, message, timestamp }
│
├─ "typing"
│  └─ Payload: { roomId, userId }
│
└─ "disconnect" [automatic]

Server → Client:
├─ "message"
│  └─ Payload: Encrypted message object
│
├─ "typing"
│  └─ Payload: { userId, isTyping }
│
└─ "connect" / "disconnect" [automatic]
```

---

## 🪝 Context & State Management

### UserContext
```javascript
// File: context/UserContext.js
import { createContext, useContext } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export default UserContext;

// Usage:
const { userId } = useUser();
```

**Provided Values:**
- `userId`: String (stored in localStorage)

**Scope:** App-wide, shared across all authenticated components

### SocketContext
```javascript
// File: context/SocketContext.js
import { createContext } from "react";

export const SocketContext = createContext(null);

// Usage:
const socket = useContext(SocketContext);
```

**Provided Values:**
- Socket.IO client instance

**Scope:** Chat components (protected routes only)

### Local Component State
```
Home.jsx:
├─ contactList: List of chats/contacts
├─ messages: Array of messages in current chat
├─ contactName: Current contact's name
├─ skip: Pagination offset for message loading
└─ isMobileChatOpen: Boolean (responsive)

ChatArea.jsx:
├─ contactData: Current contact/room info
└─ inputMessage: Current message being typed

Login.jsx:
├─ email: User email
├─ pass: User password
├─ remember: Remember me checkbox
└─ loading: Form submission loading state
```

---

## 🔗 API Endpoints

| Method | Endpoint              | Purpose                      | Auth Required |
|--------|----------------------|------------------------------|---------------|
| POST   | `/login`             | User login                   | No            |
| POST   | `/signup`            | User registration            | No            |
| POST   | `/verify-otp`        | Verify OTP during signup     | No            |
| GET    | `/me`                | Get current user info        | Yes           |
| POST   | `/contacts`          | Get user's contact/chat list | Yes           |
| POST   | `/contact`           | Get single contact info      | Yes           |
| POST   | `/messages`          | Get messages for a room      | Yes           |
| WS     | Socket.IO events     | Real-time messaging          | Yes           |

---

## 🛠 Development Guide

### Running the Project
```bash
# Install dependencies
npm install

# Development server (Vite with HMR)
npm run dev

# Build for production
npm build

# Preview production build
npm preview

# Lint code
npm run lint
```

### Adding New Components
```
1. Create component file in appropriate feature folder
2. Import required dependencies (React, hooks, routing)
3. Export as default or named export
4. Import in parent component
5. Add to routing structure if needed (pages)
6. Add styling in corresponding CSS file
```

### Adding New Routes
```javascript
// In App.jsx Routes component:
<Route
  path='/new-route'
  element={<YourComponent />}
/>

// For protected routes:
<Route
  path='/protected-route'
  element={
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <YourComponent />
    </ProtectedRoute>
  }
/>
```

### Accessing User Context
```javascript
import { useUser } from '../context/UserContext';

function MyComponent() {
  const { userId } = useUser();
  // Use userId...
}
```

### Using Socket Events
```javascript
import { SocketContext } from '../context/SocketContext';

function MyComponent() {
  const socket = useContext(SocketContext);
  
  // Listen to events
  useEffect(() => {
    socket.on('event-name', (data) => {
      // Handle data
    });
    
    return () => socket.off('event-name');
  }, [socket]);
  
  // Emit events
  socket.emit('event-name', payload);
}
```

---

## 📁 File Structure

```
socket-frontend-temp/
├── public/
│   ├── login.js          # Legacy standalone JS
│   ├── script.js         # Legacy standalone JS
│   └── signup.js         # Legacy standalone JS
│
├── src/
│   ├── app/
│   │   ├── config.js     # Configuration constants
│   │   ├── socket.js     # Socket.IO singleton
│   │   └── store.js      # Redux-like store (if used)
│   │
│   ├── components/
│   │   └── (Reusable UI components)
│   │
│   ├── context/
│   │   ├── SocketContext.js    # Socket context provider
│   │   └── UserContext.js      # User data context
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── OtpVerification.jsx
│   │   ├── chat/
│   │   │   ├── ChatArea.jsx
│   │   │   ├── DefaultChatArea.jsx
│   │   │   ├── MessageElement.jsx
│   │   │   └── MessageInput.jsx
│   │   ├── contacts/
│   │   │   └── ContactItem.jsx
│   │   └── profile/
│   │       └── ProfileDrawer.jsx
│   │
│   ├── hooks/
│   │   └── (Custom React hooks)
│   │
│   ├── layouts/
│   │   └── AuthLayout.jsx      # Auth pages wrapper
│   │
│   ├── pages/
│   │   ├── Home.jsx            # Main chat page
│   │   └── css/
│   │       ├── home.css
│   │       ├── otp-verification.css
│   │       └── auth.css
│   │
│   ├── routes/
│   │   └── ProtectedRoute.jsx   # Route guard component
│   │
│   ├── services/
│   │   └── socket.service.js    # Socket service utilities
│   │
│   ├── sockets/
│   │   └── message.socket.js    # Message event handlers
│   │
│   ├── styles/
│   │   └── (Global styles)
│   │
│   ├── utils/
│   │   └── (Utility functions)
│   │
│   ├── App.jsx                  # Root component
│   ├── App.css                  # App styles
│   ├── index.css                # Global styles
│   └── main.jsx                 # Entry point
│
├── index.html                   # HTML entry
├── login.html                   # Standalone login page
├── main.html                    # Standalone main page
├── main2.html                   # Standalone variant
├── main3.html                   # Standalone variant
│
├── vite.config.js              # Vite configuration
├── eslint.config.js            # ESLint rules
├── package.json                # Dependencies & scripts
├── PATH.md                      # Path documentation
├── README-DETAILED.md           # Detailed README
├── WORKFLOW.md                  # This file
└── .gitignore
```

---

## 🔄 State Management Flow Summary

```
User Action (Click, Type, etc.)
  │
  ├─ Trigger event handler
  │
  ├─ Validate input
  │
  ├─ API Call OR Socket.emit()
  │  │
  │  ├─ API: fetch() to REST endpoint
  │  └─ Socket: WebSocket message to server
  │
  ├─ Receive response
  │
  ├─ Update local state
  │  ├─ useState() for component-level
  │  └─ useContext() consume context
  │
  └─ Trigger re-render
     │
     └─ UI updates with new data
```

---

## 🚀 Performance Considerations

1. **Message Pagination**: `skip` parameter prevents loading all messages at once
2. **Socket Event Cleanup**: `socket.off()` in useEffect cleanup prevents memory leaks
3. **Lazy Loading**: Contact list can be paginated
4. **Encryption**: End-to-end encryption handles sensitive data
5. **Credential Handling**: Secure cookie-based authentication

---

## 🔒 Security Notes

- **Credentials**: `credentials: "include"` for secure cookie transmission
- **Encryption**: Message payloads encrypted with `encryptedPayload.cipherText`
- **Input Validation**: Email regex, password length checks on frontend
- **OTP Verification**: Secondary authentication factor for signups
- **Protected Routes**: ProtectedRoute component prevents unauthorized access

---

## 📝 Common Troubleshooting

### Socket Not Connecting
- Check backend server is running on `localhost:3000`
- Verify `withCredentials: true` in socket configuration
- Check browser console for connection errors

### Messages Not Loading
- Verify `roomId` is correctly passed from URL params
- Check Network tab for failed `/messages` API calls
- Ensure user is authenticated (check localStorage userId)

### State Not Updating
- Verify Context is properly provided in component tree
- Check component is consuming context correctly with `useContext()`
- Ensure dependency arrays in useEffect are complete

### Authentication Issues
- Clear browser localStorage and cookies
- Verify backend is accepting credentials
- Check `/me` endpoint returns valid user

---

## 📚 References

- [React Documentation](https://react.dev)
- [React Router v7](https://reactrouter.com)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Vite Documentation](https://vitejs.dev)
- [ESLint Configuration](https://eslint.org)

---

**Last Updated:** April 4, 2026  
**Project Version:** 0.0.0  
**Status:** Active Development
