# BlueChat - Real-time Chat Application

A modern real-time chat application built with React 19, Socket.IO, and React Router v7. Features end-to-end encryption, multi-device support, and a WhatsApp-inspired UI.

---

## 📋 Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Architecture](#project-architecture)
3. [Routing Structure](#routing-structure)
4. [Detailed Component Flow](#detailed-component-flow)
5. [State Management](#state-management)
6. [Socket Integration](#socket-integration)
7. [API Integration](#api-integration)
8. [Authentication Flow](#authentication-flow)
9. [Chat Flow](#chat-flow)
10. [File Structure](#file-structure)
11. [Key Utilities & Hooks](#key-utilities--hooks)

---

## 🛠 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.4 | UI framework |
| **React Router DOM** | 7.13.1 | Client-side routing |
| **Socket.IO Client** | 4.8.3 | Real-time bidirectional communication |
| **Vite** | 8.0.1 | Build tool & dev server |
| **ESLint** | 9.39.4 | Code linting |

---

## 🏗 Project Architecture

```
socket-frontend-temp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Auth/           # Authentication components
│   │   ├── Home/           # Chat-related components
│   │   └── ProtectedRoute.jsx  # Route guard
│   ├── context/            # React Context providers
│   │   ├── SocketContext.js   # Socket.IO instance
│   │   └── UserContext.js     # User data
│   ├── pages/              # Page-level components
│   │   ├── Auth.jsx        # Authentication layout
│   │   ├── Home.jsx        # Main chat interface
│   │   └── css/            # Page-specific styles
│   ├── services/           # API & Socket services
│   │   └── socket.js       # Socket initialization
│   ├── sockets/            # Socket event handlers
│   │   └── message.socket.js
│   └── index.css           # Global styles
├── package.json
├── vite.config.js
└── README.md
```

**Architecture Pattern**: Component-based architecture with Context API for global state and Socket.IO for real-time events.

---

## 🛣 Routing Structure

### Route Configuration (App.jsx)

```jsx
<Routes>
  ├── /auth
  │   ├── /auth/login        → Login component
  │   ├── /auth/signup       → Signup component
  │   └── /auth (index)      → Redirects to /auth/login
  │
  ├── /chat
  │   ├── /chat              → DefaultChatArea (welcome screen)
  │   ├── /chat/:contactId   → ChatArea (specific conversation)
  │   └── Protected by: ProtectedRoute
  │
  └── * (wildcard)           → Redirects to /auth/login
```

**Route Guards**:
- `ProtectedRoute`: Checks `isAuthenticated` before allowing access to `/chat` routes
- Authentication pages redirect to `/chat` if already authenticated

---

## 🔄 Detailed Component Flow

### 1. Entry Point & Root

#### **main.jsx**
- Renders React app with `StrictMode` and `BrowserRouter`
- Wraps entire app with routing context

```jsx
<BrowserRouter>
  <App />
</BrowserRouter>
```

---

### 2. Root App Component (App.jsx)

**Responsibilities**:
- Authentication state management
- Socket initialization
- Context providers
- Route definitions

**State**:
```javascript
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [socket, setSocket] = useState(null);
const [loading, setLoading] = useState(true);
```

**Lifecycle**:
1. **Mount**: Check auth status via `/me` API endpoint
2. **If authenticated**: Initialize Socket.IO connection
3. **Provide contexts**: `SocketContext` & `UserContext`

**Context Providers**:
```jsx
<SocketContext.Provider value={socket}>
  <UserContext.Provider value={{ userId }}>
    <Routes>...</Routes>
  </UserContext.Provider>
</SocketContext.Provider>
```

---

### 3. Authentication Pages

#### **pages/Auth.jsx** (Layout)

- Container for login/signup forms
- Side-by-side layout: image section + form section
- Uses `Outlet` for nested route rendering
- Redirects to `/chat` if already authenticated

#### **components/Auth/Login.jsx**

**State**:
```javascript
const [email, setEmail] = useState("");
const [pass, setPass] = useState("");
const [remember, setRemember] = useState(false);
const [loading, setLoading] = useState(false);
```

**Flow**:
1. User fills form → validation
2. POST to `/login` with credentials
3. On success:
   - Store `userId` in localStorage
   - Call `setIsAuthenticated(true)` from outlet context
   - Redirect to `/chat`

#### **components/Auth/Signup.jsx**

Similar to Login but with additional fields:
- Name, Email, Password, Terms checkbox
- On successful signup → opens OTP verification modal

#### **components/Auth/OtpVerification.jsx**

**Features**:
- 6-digit OTP input with auto-focus
- Timer (30s) for resend
- Paste support for OTP
- Keyboard navigation (Backspace, Arrow keys)
- POST to `/verify-otp`

**State**:
```javascript
const [code, setCode] = useState(Array(6).fill(""));
const [status, setStatus] = useState("idle"); // idle | loading | success | error
const [timer, setTimer] = useState(0);
```

**Success**: Stores `userId` in localStorage and calls `setIsAuthenticated(true)`

---

### 4. Home/Chat Pages

#### **pages/Home.jsx** (Main Chat Layout)

**Responsibilities**:
- Fetch and display contact list
- Fetch messages for selected contact
- Handle socket message events
- Conditional rendering: sidebar + chat area

**State**:
```javascript
const [contactList, setContactList] = useState([]);
const [messages, setMessages] = useState([]);
const [contactName, setContactName] = useState("");
const [skip, setSkip] = useState(0);
```

**Data Flow**:

```
1. Mount → Fetch contacts from /contacts API
2. When contactId param changes:
   - Find contact name from contactList
   - Fetch messages from /messages API (with contactId & skip)
3. Socket listener:
   - socket.on("message", handleMessage)
   - Filters messages by senderId
   - Appends to messages state
```

**Layout**:
- Sidebar: Contact list + mobile tabs
- Chat Area: Rendered via `<Outlet>` with context:
  ```jsx
  <Outlet context={{ messages, contactName, contactId }} />
  ```

---

#### **components/Home/ContactItem.jsx**

**Props**:
```javascript
{
  roomId, contactId, name, lastMsg, time, unread, isActive
}
```

**Functionality**:
- Click → navigate to `/chat/:contactId`
- Displays: avatar, name, last message preview

---

#### **components/Home/DefaultChatArea.jsx**

Shown when no contact is selected (index route of `/chat`).
Displays welcome message and feature highlights.

---

#### **components/Home/ChatArea.jsx**

Active conversation view.

**Data Sources**:
- `messages`, `contactName` from Outlet context (Home.jsx)
- `contactId` from route params
- `socket` from SocketContext

**Key Functions**:
```javascript
// Fetch contact details on mount/contactId change
async function fetchContact() {
  const res = await fetch("/contact", {
    method: "POST",
    body: JSON.stringify({ contactId })
  });
  setContactName(data.contactName);
}

// Send message via socket
function sendMessage() {
  socket.emit("message", { contactId, message: inputMessage });
}
```

**Components Used**:
- `MessageElement` (renders each message)
- `MessageInput` (input field + send button)

---

#### **components/Home/MessageElement.jsx**

**Message Types**:
1. **Text**: Renders `encryptedPayload.cipherText` with timestamp
2. **Image**: Renders image with overlay time

**Styling**:
- `sendByMe` → `msg-row out` (right-aligned)
- `sendByMe === false` → `msg-row in` (left-aligned)

---

#### **components/Home/MessageInput.jsx**

**Props**:
```javascript
{ inputMessage, setInputMessage, sendMessage }
```

**Features**:
- Textarea with auto-resize (implied)
- Enter to send (Shift+Enter for new line)
- Send button and mic button (mic non-functional)

---

#### **components/Home/ProfileDrawer.jsx**

Placeholder component for contact profile view.
Shows: avatar, name, status, phone, about, media, block/report buttons.

---

### 5. Route Protection

#### **components/ProtectedRoute.jsx**

```javascript
if (!isAuthenticated) {
  return <Navigate to="/auth/login" replace />;
}
return children;
```

Used to wrap `/chat` routes in App.jsx.

---

## 🌐 State Management

### Context API

#### **SocketContext** (context/SocketContext.js)

```javascript
export const SocketContext = createContext(null);
```

- Provides socket instance to entire app
- Initialized in App.jsx via `getSocket()` from `services/socket.js`

#### **UserContext** (context/UserContext.js)

```javascript
const UserContext = createContext();
export const useUser = () => useContext(UserContext);
```

- Provides `{ userId }` from localStorage
- Used across components to identify current user

---

## 🔌 Socket Integration

### **services/socket.js**

Singleton pattern for Socket.IO client:

```javascript
let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3000", {
      withCredentials: true,
      autoConnect: false
    });
    socket.once("connect", () => console.log("Socket connected!"));
    socket.once("disconnect", () => console.log("Socket disconnected!"));
  }
  return socket;
};

export const getSocket = () => { /* returns socket or throws */ };
export const connectSocket = () => { /* manual connect */ };
export const disconnectSocket = () => { /* manual disconnect */ };
```

**Usage**:
1. `initSocket()` called in App.jsx when authenticated
2. `getSocket()` retrieves instance
3. `connectSocket()` connects (since autoConnect=false)
4. Socket passed down via `SocketContext`

### **sockets/message.socket.js**

Placeholder/example file for organizing socket event listeners.

---

## 🌐 API Integration

All API calls use `fetch` with `credentials: "include"` for session cookies.

### Endpoints Used

| Endpoint | Method | Purpose | Called From |
|----------|--------|---------|-------------|
| `/me` | GET | Check auth status | App.jsx (mount) |
| `/login` | POST | User login | Login.jsx |
| `/signup` | POST | User registration | Signup.jsx |
| `/verify-otp` | POST | Verify OTP | OtpVerification.jsx |
| `/resend-otp` | POST | Resend OTP | OtpVerification.jsx |
| `/contacts` | POST | Fetch contact list | Home.jsx |
| `/messages` | POST | Fetch message history | Home.jsx |
| `/contact` | POST | Fetch single contact | ChatArea.jsx |

---

## 🔐 Authentication Flow

```
1. User accesses app
   ↓
2. App.jsx mounts → GET /me
   ├─ Success → isAuthenticated=true → Initialize socket → Show /chat
   └─ Fail → isAuthenticated=false → Show /auth/login

3. Login/Signup
   ├─ Login POST /login
   │   └─ Success → localStorage.setItem("userId") → setIsAuthenticated(true)
   └─ Signup POST /signup
       └─ Success → Show OTP modal

4. OTP Verification POST /verify-otp
   └─ Success → localStorage.setItem("userId") → setIsAuthenticated(true)

5. ProtectedRoute redirects unauthenticated users to /auth/login
```

---

## 💬 Chat Flow

```
1. User navigates to /chat (Home.jsx)
   ↓
2. Mount → Fetch contacts from /contacts
   ↓
3. User selects contact (click ContactItem)
   ↓
4. Navigate to /chat/:contactId
   ↓
5. Home.jsx detects contactId change:
   - Find contactName from contactList
   - Fetch messages from /messages?contactId&skip
   ↓
6. ChatArea.jsx mount:
   - Fetch contact details from /contact
   - Listen to socket "message" event
   ↓
7. User types message → sendMessage()
   - socket.emit("message", { contactId, message })
   - Backend broadcasts to recipient
   ↓
8. Recipient receives socket "message"
   - Appends to messages state
   - UI updates automatically

Real-time messages are deduplicated by senderId:
- If message.senderId === contactId → add to chat
- If message.senderId === userId → add to chat
```

---

## 📁 File Structure (Detailed)

```
src/
├── App.jsx                    # Root component, auth state, socket init
├── App.css                    # App-level styles
├── main.jsx                   # Entry point
├── index.css                  # Global CSS
│
├── components/
│   ├── Auth/
│   │   ├── Login.jsx         # Login form
│   │   ├── Signup.jsx        # Registration form
│   │   └── OtpVerification.jsx # 6-digit OTP modal
│   │
│   ├── Home/
│   │   ├── ChatArea.jsx      # Active conversation view
│   │   ├── ContactItem.jsx   # Contact list item
│   │   ├── DefaultChatArea.jsx # Welcome screen (no contact selected)
│   │   ├── MessageElement.jsx # Single message bubble
│   │   ├── MessageInput.jsx  # Message composer
│   │   └── ProfileDrawer.jsx # Contact profile panel (static)
│   │
│   └── ProtectedRoute.jsx    # Auth guard component
│
├── context/
│   ├── SocketContext.js      # Socket.IO context
│   └── UserContext.js        # User data context
│
├── pages/
│   ├── Auth.jsx              # Auth layout wrapper
│   ├── Home.jsx              # Main chat layout + contact list
│   └── css/
│       ├── auth.css          # Auth page styles
│       ├── home.css          # Home page styles
│       └── otp-verification.css # OTP modal styles
│
├── services/
│   └── socket.js             # Socket initialization singleton
│
└── sockets/
    └── message.socket.js     # Socket event handlers (ready for expansion)
```

---

## 🎯 Key Components Deep Dive

### App.jsx

**Central orchestrator**:
- Authentication check on mount
- Socket lifecycle tied to auth state
- Two-level routing: `/auth` and `/chat`
- Context providers for global state

**Important**: Socket is initialized only once when `isAuthenticated` becomes true.

### Home.jsx

**Most complex page component**:
- Manages contact list & message history
- Fetches data from multiple endpoints
- Socket event listener for real-time messages
- Responsive layout (sidebar visible/hidden on mobile)
- Uses `Outlet` to render ChatArea/DefaultChatArea

**Outlets with Context**:
```jsx
<Outlet context={{ messages, contactName, contactId }} />
```
Child components access via `useOutletContext()`.

### ChatArea.jsx

**Conversation view**:
- Receives `messages`, `contactName` from parent via outlet context
- Fetches additional contact details
- Renders message list with `MessageElement`
- `MessageInput` composition
- Uses `socket.emit()` to send messages

---

## 🔌 Socket Events

### Current Implementation

| Event | Direction | Payload | Handler |
|-------|-----------|---------|---------|
| `message` | Server → Client | `{ senderId, message, time, ... }` | Home.jsx appends to state |
| `message` | Client → Server | `{ contactId, message }` | Backend broadcasts to room |

**Socket Setup**:
```javascript
// Home.jsx
useEffect(() => {
  const handleMessage = (message) => {
    if (message.senderId === contactId) {
      message.sendByMe = false;
      setMessages(prev => [...prev, message]);
    }
    if (message.senderId === userId) {
      message.sendByMe = true;
      setMessages(prev => [...prev, message]);
    }
  };
  socket.on("message", handleMessage);
  return () => socket.off("message", handleMessage);
}, [socket, contactId]);
```

---

## 📱 Responsive Design

**Classes used**:
- `hidden-mobile` / `visible-mobile`: Toggle sidebar visibility
- `mobile-tabs`: Bottom navigation on mobile
- Contact list takes full width when no chat selected

---

## 🎨 Styling Strategy

- **CSS Files**: Component-specific CSS in `pages/css/` and component directories
- **Font Awesome**: Used for icons (`fas fa-*`)
- **CSS Variables**: Referenced (e.g., `var(--primary)`) but not defined in this codebase
- **No CSS-in-JS**: Plain CSS with global class naming

---

## 🔄 Data Fetching Pattern

All API calls:
1. POST method (even for data retrieval)
2. `credentials: "include"` for session cookies
3. Manual JSON parsing
4. Error handling via `res.ok`

Example:
```javascript
const res = await fetch("/contacts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include"
});
const data = await res.json();
if (res.ok) setContactList(data.contacts);
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

**Backend Requirement**: Requires running backend server at `http://localhost:3000` with Socket.IO support.

---

## 📝 Notable Design Decisions

1. **Socket singleton**: Global singleton pattern ensures single connection
2. **Context over props**: Deep component tree avoids prop drilling
3. **Outlet context**: Parent (Home.jsx) passes data to child routes efficiently
4. **Socket cleanup**: Event listeners removed on unmount or `contactId` change
5. **Index routes**: `/auth` redirects to `/auth/login` for cleaner URLs
6. **ProtectedRoute as wrapper**: Simple guard pattern
7. **API consistency**: All requests POST with credentials

---

## 🔮 Potential Improvements

1. **Environment variables**: Hardcoded `localhost:3000` should be configurable
2. **Error handling**: Minimal error UI, mostly console logs
3. **Loading states**: Spinner shown only during initial auth check
4. **Pagination**: Messages fetched once; no infinite scroll
5. **OTP modal**: Could be a dedicated route instead of modal
6. **Socket reconnection**: Not explicitly handled
7. **TypeScript**: All files are JavaScript
8. **Message encryption**: `encryptedPayload.cipherText` shown; key management unclear

---

## 📚 Summary

This is a **fully functional real-time chat application** with:

- ✅ User authentication (login, signup, OTP verification)
- ✅ Real-time messaging via Socket.IO
- ✅ Contact list with recent messages
- ✅ Message history loading
- ✅ Mobile-responsive layout
- ✅ Route-based navigation
- ✅ Context-based state sharing
- ✅ Clean component separation

The architecture follows **React best practices** with functional components, hooks, context, and composition. The codebase is relatively small but demonstrates solid patterns for scaling.

---

**Built with ❤️ using React 19 & Socket.IO**
