# Application Workflow Documentation

## Overview

This is a real-time chat application with JWT authentication, contact management, and WebSocket-based messaging. The architecture follows Express.js with Socket.IO for real-time communication.

---

## 1. HTTP Routes Workflow

### 1.1 Authentication Routes (`/auth.routes.js`)

#### **POST /signup**
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST {username, email, password}
       ▼
┌─────────────────────────────────────────────┐
│  handlePostSignup (auth.controller.js)     │
│  ┌──────────────────────────────────────┐  │
│  │ 1. Validate user data                │  │
│  │ 2. Check if email exists             │  │
│  │ 3. Generate 6-digit OTP              │  │
│  │ 4. Hash password with Argon2         │  │
│  │ 5. Save OTP record                   │  │
│  └──────────────────────────────────────┘  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │  SMTP Service   │ (Commented out)
        └────────┬────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│            Response: 200 JSON                │
│  ┌──────────────────────────────────────┐  │
│  │ {                                   │  │
│  │   "success": true,                  │  │
│  │   "message": "OTP sent to email",  │  │
│  │   "redirectedTo": "verify-otp"      │  │
│  │ }                                   │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

**Parameters:** 
- Body: `{ username: string, email: string, password: string }`

**Use Case:** User registration with email OTP verification

**Returns:** Success message with redirect hint

**Error Cases:**
- 400: Validation failure or email already exists
```

---

#### **POST /verify-otp**
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST {email, otp}
       ▼
┌─────────────────────────────────────────────┐
│  verifySignupOTP (auth.controller.js)      │
│  ┌──────────────────────────────────────┐  │
│  │ 1. Find OTP record by email & OTP    │  │
│  │ 2. Extract username & hashed password│  │
│  │ 3. Generate RSA key pair             │  │
│  │ 4. Generate unique userId            │  │
│  │ 5. Create User document              │  │
│  │ 6. Generate JWT token (7d expiry)    │  │
│  │ 7. Set httpOnly cookie               │  │
│  │ 8. Delete OTP record                 │  │
│  └──────────────────────────────────────┘  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │  Response: 200  │
        └─────────────────┘
        ┌──────────────────────────────────────┐
        │ {                                   │
        │   "success": false,                 │ ← Note: success=false is intentional
        │   "message": "User registered...", │
        │   "privateKey": "<RSA-private-key>" │
        │ }                                   │
        └──────────────────────────────────────┘

**Parameters:**
- Body: `{ email: string, otp: string }`

**Use Case:** Verify OTP and complete user registration, return private key for encryption

**Returns:** Private key for end-to-end encryption, user credentials stored

**Error Cases:**
- 400: Invalid OTP
```

---

#### **POST /login**
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST {email, password}
       ▼
┌─────────────────────────────────────────────┐
│  handlePostLogin (auth.controller.js)      │
│  ┌──────────────────────────────────────┐  │
│  │ 1. Validate email & password         │  │
│  │ 2. Find user by email                │  │
│  │ 3. Verify password with Argon2       │  │
│  │ 4. Generate JWT token (7d expiry)    │  │
│  │ 5. Set httpOnly cookie               │  │
│  └──────────────────────────────────────┘  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │  Response: 200  │
        └─────────────────┘
        ┌──────────────────────────────────────┐
        │ {                                   │
        │   "success": true,                  │
        │   "message": "Login successful",    │
        │   "redirectedTo": "/chat"           │
        │ }                                   │
        └──────────────────────────────────────┘

**Parameters:**
- Body: `{ email: string, password: string }`

**Use Case:** User authentication and session creation

**Returns:** Success message with redirect URL

**Error Cases:**
- 400: Invalid credentials or validation failure
```

---

#### **GET /me**
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ GET (with cookie)
       ▼
┌─────────────────────────────────────────────┐
│  checkAuth (auth.controller.js)            │
│  ┌──────────────────────────────────────┐  │
│  │ 1. Extract token from cookies        │  │
│  │ 2. Verify JWT token                  │  │
│  │ 3. Return decoded payload            │  │
│  └──────────────────────────────────────┘  │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   │
┌──────────────┐   ┌──────────────┐
│ 200 JSON     │   │ 401 JSON     │
│ {status:true,│   │ {status:false│
│  user:{      │   │  message:"...│
│   userId,    │   │ }            │
│   iat, exp   │   └──────────────┘
│ }}           │
└──────────────┘

**Parameters:** 
- Headers: Cookie with 'token'

**Use Case:** Check if user is authenticated, refresh/verify session

**Returns:** User payload from JWT or unauthorized error

**Error Cases:**
- 401: No token or invalid token
```

---

### 1.2 Main Routes (`main.routes.js`)

#### **GET /chat**
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ GET
       ▼
┌─────────────────────────────────────────────┐
│  handleGetIndexPage (main.controller.js)   │
│  ┌──────────────────────────────────────┐  │
│  │ 1. Render EJS view                   │  │
│  │    (views/chat.ejs or similar)      │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │  HTML Response  │
        └─────────────────┘

**Parameters:** None

**Use Case:** Serve the main chat interface page

**Returns:** Rendered EJS template for chat UI

**Error Cases:** None (static page serve)
```

---

### 1.3 Contact Routes (`contact.route.js`)

#### **POST /contacts** (Protected)
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST (with JWT cookie)
       ▼
┌─────────────────────────────────────────────┐
│  isAuthenticated (auth.middleware.js)      │
│  ┌──────────────────────────────────────┐  │
│  │ 1. Extract token from cookie         │  │
│  │ 2. Verify JWT                        │  │
│  │ 3. Attach user to req.user           │  │
│  └──────────────────────────────────────┘  │
│              ✓ Passed                      │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│  handleGetContacts (contact.controller.js) │
│  ┌──────────────────────────────────────┐  │
│  │ 1. Get userId from req.user          │  │
│  │ 2. Find all chats where user is      │  │
│  │    participant (sorted by updated)   │  │
│  │ 3. Get user's saved contacts         │  │
│  │ 4. Separate group & peer chats       │  │
│  │ 5. For peer chats:                   │  │
│  │    - Extract other participant       │  │
│  │    - Fetch user details (email)      │  │
│  │    - Get contact name from saved     │  │
│  │ 6. Merge & sort by last message time │  │
│  └──────────────────────────────────────┘  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │  Response: 200  │
        └─────────────────┘
        ┌──────────────────────────────────────┐
        │ {                                   │
        │   "success": true,                  │
        │   "chats": [                        │
        │     {                               │
        │       "roomId": "string",           │
        │       "type": "group" | "peer",     │
        │       "name": "string",             │
        │       "participants": [...],        │
        │       "sentBy": "string|null",      │
        │       "lastMessage": "string",      │
        │       "lastMessageTime": "date",    │
        │       "email": "string|null",       │  // Peer only
        │       "contactId": "string"         │  // Peer only
        │     }                               │
        │   ]                                 │
        │ }                                   │
        └──────────────────────────────────────┘

**Parameters:** None (uses req.user from middleware)

**Use Case:** Fetch all user's chat conversations (both individual and group)

**Returns:** Sorted list of all chats with last message preview

**Error Cases:** Handled by asyncHandler wrapper
```

---

#### **POST /contact** (Protected)
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST {roomId}
       ▼
┌─────────────────────────────────────────────┐
│  isAuthenticated (auth.middleware.js)      │
│  (same as above)                           │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│  handleGetContactName (contact.controller) │
│  ┌──────────────────────────────────────┐  │
│  │ 1. Get userId & roomId from body     │  │
│  │ 2. Find chat room by chatId          │  │
│  │ 3. Filter out current user           │  │
│  │ 4. Get user's saved contacts         │  │
│  │ 5. Build contact list with names     │  │
│  └──────────────────────────────────────┘  │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   │
   ┌─────────────┐   ┌─────────────┐
   │ Room not    │   │ 200 JSON    │
   │ found error │   └─────────────┘
   └─────────────┘   ┌────────────────────────┐
                     │ Peer (1 participant): │
                     │ {                     │
                     │   "success": true,    │
                     │   "contactName": "...",│
                     │   "type": "peer"      │
                     │ }                     │
                     │                       │
                     │ Group (2+):           │
                     │ {                     │
                     │   "success": true,    │
                     │   "contactList": [...],│
                     │   "roomName": "...",  │
                     │   "type": "group"     │
                     │ }                     │
                     └────────────────────────┘

**Parameters:**
- Body: `{ roomId: string }`

**Use Case:** Get participant details for a specific chat room (useful for header display)

**Returns:** Contact name(s) and room info

**Error Cases:**
- 400: Room not found
- 404 if Chat not found (in which case error is thrown)
```

---

### 1.4 Message Routes (`message.route.js`)

#### **POST /messages** (Protected)
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST {contactId, skip}
       ▼
┌─────────────────────────────────────────────┐
│  isAuthenticated (auth.middleware.js)      │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│  handleGetContactMessages (message.contr)  │
│  ┌──────────────────────────────────────┐  │
│  │ 1. Get userId from req.user          │  │
│  │ 2. Extract contactId & skip from body│  │
│  │ 3. Generate roomId using getRoomId() │  │
│  │ 4. Query Messages collection:        │  │
│  │    - Match roomId                    │  │
│  │    - Sort by createdAt desc          │  │
│  │    - Skip N messages                 │  │
│  │    - Limit 50                        │  │
│  │ 5. Transform messages:               │  │
│  │    - Add sendByMe flag               │  │
│  │    - Format time with getLocalDate() │  │
│  │ 6. Reverse array (oldest first)      │  │
│  └──────────────────────────────────────┘  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │  Response: 200  │
        └─────────────────┘
        ┌──────────────────────────────────────┐
        │ {                                   │
        │   "success": true,                  │
        │   "messages": [                     │
        │     {                               │
        │       "messageId": "msg_...",       │
        │       "roomId": "...",              │
        │       "senderId": "...",            │
        │       "encryptedPayload": {         │
        │         "cipherText": "...",        │
        │         "noance": "default"         │
        │       },                            │
        │       "sendByMe": true|false,       │
        │       "time": "HH:MM AM/PM"         │
        │     }                               │
        │   ]                                 │
        │ }                                   │
        └──────────────────────────────────────┘

**Parameters:**
- Body: `{ contactId: string, skip: number }`

**Use Case:** Paginated fetch of messages for a specific contact/room

**Returns:** Array of up to 50 messages (with encryption envelope)

**Error Cases:** Handled by asyncHandler wrapper
```

---

## 2. Socket.IO Connection & Events Flow

### 2.1 Connection Establishment
```
┌─────────────┐
│   Client    │ (with JWT token in handshake)
└──────┬──────┘
       │ Socket.IO handshake
       │ with auth token
       ▼
┌─────────────────────────────────────────────┐
│  isSocketAuthenticated (middleware)        │
│  ┌──────────────────────────────────────┐  │
│  │ 1. Parse cookies or auth.token       │  │
│  │ 2. Verify JWT                        │  │
│  │ 3. Fetch full user from DB           │  │
│  │ 4. Attach {email, username, userId} │  │
│  │    to socket.user                     │  │
│  └──────────────────────────────────────┘  │
│              ✓ Authenticated               │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  socketHandler (sockets/connection.js)     │
│  ┌──────────────────────────────────────┐  │
│  │ 1. Add user to OnlineUser service    │  │
│  │ 2. Call handleConnectContactRoom     │  │
│  │ 3. Setup event listeners:            │  │
│  │    - "online-status"                 │  │
│  │    - "message" (via socketMessage)  │  │
│  │ 4. On disconnect: update lastSeen    │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

### 2.2 Room Connection (`handleConnectContactRoom`)
```
┌─────────────────────────────────────────────┐
│  handleConnectContactRoom (connection.hdl) │
│  ┌──────────────────────────────────────┐  │
│  │ 1. socket.join(userId)               │  │ ← Personal room
│  │ 2. Find all peer chats where user   │  │    for direct messages
│  │    is participant                   │  │
│  │ 3. For each chat: socket.join(room) │  │    (can message directly)
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

**Result:** User joins their personal room + all 1:1 chat rooms
**Use:** Enables direct socket.to(userId).emit() for DMs
```

---

### 2.3 Online Status Check
```
Client emits: socket.emit("online-status", { contactId })

┌─────────────────────────────────────────────┐
│  socket.on("online-status")                │
│  ┌──────────────────────────────────────┐  │
│  │ Check if contactId in OnlineUser     │  │
│  └──────────────────────────────────────┘  │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   │
   ┌─────────────┐   ┌─────────────┐
   │ Online:     │   │ Offline:    │
   │ socket.emit │   │ socket.emit │
   │ {status:    │   │ {status:    │
   │  "online"}  │   │  "offline", │
   └─────────────┘   │  lastSeen:  │
                    │  "..."}     │
                    └─────────────┘

**Parameters:** `{ contactId: string }`
**Use Case:** Check if a contact is currently online
**Returns:** Status + lastSeen if offline
```

---

### 2.4 Message Sending (Real-time)
```
Client emits: socket.emit("message", { roomId, message })

┌─────────────────────────────────────────────┐
│  socketMessageHandler (sockets/message.js)│
│  ┌──────────────────────────────────────┐  │
│  │ 1. Validate roomId format            │  │
│  │ 2. Create message object via         │  │
│  │    getMessageObject():               │  │
│  │    {                                 │  │
│  │      messageId: "msg_" + Date.now(),│  │
│  │      roomId, senderId,               │  │
│  │      encryptedPayload: {             │  │
│  │        cipherText,                   │  │
│  │        noance: "default"             │  │
│  │      }                               │  │
│  │    }                                 │  │
│  │ 3. Save to Message collection        │  │
│  │ 4. Update Chat: lastMessage,         │  │
│  │    lastMessageSender                │  │
│  │ 5. Broadcast: socket.to(roomId)      │  │
│  │    .emit("message", message)        │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

**Flow:**
```
Client A ───socket.emit("message", {roomId, message})───► Server
   │                                                            │
   │  Save to DB                                               │
   │  Update Chat                                              │
   │                                                            │
   └──────────socket.to(roomId).emit("message", msg)──────────┼─→ Client B (in room)
                                                                 └─→ Client C (in room)
```

**Parameters:** `{ roomId: string, message: string (encrypted) }`

**Use Case:** Send encrypted message to room (1:1 or group)

**Returns:** Broadcasts to all room participants except sender

**Side Effects:** 
- Message persisted to MongoDB
- Chat document's lastMessage updated
- Other clients receive message in real-time
```

---

### 2.5 Disconnect Handling
```
socket.on('disconnect', ...)

┌─────────────────────────────────────────────┐
│  Connection Handler (disconnect)           │
│  ┌──────────────────────────────────────┐  │
│  │ 1. Update User.lastSeen to now       │  │
│  │ 2. Remove from OnlineUser service    │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

**Use Case:** Mark user as offline, update last seen timestamp
```

---

## 3. Middleware Flow

### 3.1 Authentication Flow (Protected HTTP Routes)
```
┌──────────────┐
│   Request    │
│  (with cookie)│
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│  isAuthenticated (middleware)              │
│  ┌──────────────────────────────────────┐  │
│  │ Extract token from req.cookies.token │  │
│  │ Verify JWT with secret               │  │
│  │ Attach {userId, iat, exp} to req.user│  │
│  └──────────────────────────────────────┘  │
│              ✓ Passes                      │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │  Controller     │
        │  Handler        │
        └─────────────────┘

**Protected Routes:**
- POST /contacts
- POST /contact
- POST /messages
- GET /chat (via isAuthenticated middleware)

**Token Location:** httpOnly cookie named 'token'
**Token Expiry:** 7 days
```

---

### 3.2 Socket Authentication Flow
```
┌──────────────┐
│  Socket.IO   │
│  Handshake   │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│  isSocketAuthenticated (middleware)        │
│  ┌──────────────────────────────────────┐  │
│  │ Parse socket.handshake.headers.cookie│  │
│  │ Or socket.handshake.auth.token       │  │
│  │ Verify JWT                           │  │
│  │ Find user by userId                  │  │
│  │ Attach {email, username, userId}     │  │
│  │ to socket.user                       │  │
│  └──────────────────────────────────────┘  │
│              ✓ Passes                      │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │  socket.on('connection')│
        │  Handler         │
        └─────────────────┘

**Token Sources (priority order):**
1. socket.handshake.auth.token
2. socket.handshake.headers.cookie

**Result:** socket.user populated with full user object
```

---

## 4. Data Models & Relationships

### 4.1 User Model
```
{
  _id: ObjectId,
  username: string,
  email: string,
  password: string (argon2 hash),
  publicKey: string (RSA public key),
  privateKey: string? (returned once, not stored),
  userId: string (unique ID, e.g., "user_xxx"),
  lastSeen: ISOString,
  contacts: [
    {
      userId: string,
      name: string
    }
  ],
  createdAt: Date,
  updatedAt: Date
}

**Relationships:**
- One-to-Many with Chat (as participant)
- One-to-Many with Message (as sender)
```

---

### 4.2 Chat Model
```
{
  _id: ObjectId,
  chatId: string (unique, e.g., "chat_xxx"),
  type: "peer" | "group",
  participants: [userId1, userId2, ...],
  groupName?: string (for groups),
  lastMessage: string (encrypted cipher text),
  lastMessageSender: userId,
  createdAt: Date,
  updatedAt: Date
}

**Relationships:**
- Many-to-Many with User (participants)
- One-to-Many with Message (via chatId)
```

---

### 4.3 Message Model
```
{
  _id: ObjectId,
  roomId: string (chatId),
  senderId: string (userId),
  encryptedPayload: {
    cipherText: string,
    noance: string
  },
  createdAt: Date
}

**Relationships:**
- Many-to-One with Chat (roomId → chatId)
- Many-to-One with User (senderId → userId)
```

---

### 4.4 OTP Model
```
{
  _id: ObjectId,
  email: string,
  username: string,
  password: string (argon2 hash),
  otp: string (6-digit),
  createdAt: Date
}

**Purpose:** Temporary storage during signup flow
**TTL:** Should be cleaned up or expired (not implemented)
```

---

## 5. Utility Functions

### 5.1 getRoomId
```
getRoomId({ userId, targetId })
  ├─ Sorts both IDs alphabetically
  ├─ Concatenates with underscore
  └─ Returns: "smallerId_largerId"

Example:
  userId="user_b", targetId="user_a"
  → "user_a_user_b"

**Use:** Deterministic room ID for 1:1 chats
```

---

### 5.2 getLocalDate
```
getLocalDate(date)
  ├─ Extracts hours, minutes, AM/PM
  └─ Returns: { time: "HH:MM AM/PM", date: "MM/DD/YYYY" }

**Use:** Format message timestamps for UI
```

---

### 5.3 validateUserId
```
validateUserId(roomId)
  ├─ Checks if roomId matches expected format
  └─ Returns: boolean

**Use:** Prevent invalid room IDs in socket messages
```

---

## 6. Services

### 6.1 OnlineUser Service
```
OnlineUser = new Map<userId, Set<socketId>>()

Methods:
  .add(userId, socketId)
    └─ Creates Set if not exists, adds socketId
  .remove(userId, socketId)
    └─ Deletes socketId from Set, cleans up empty Sets
  .has(userId)
    └─ Returns true if user has any active sockets

**Use:** Track which users are currently online
**Multi-device support:** Multiple socketIds per userId
```

---

### 6.2 Key Generation Service
```
generateKey()
  ├─ Generates RSA key pair (2048-bit)
  ├─ Returns: { publicKey, privateKey }
  └─ privateKey sent once during signup verification

**Use:** End-to-end encryption key exchange
**Storage:** publicKey stored in User, privateKey given to user
```

---

### 6.3 ID Generation Service
```
idGenerate(prefix)
  ├─ Generates: `${prefix}_${timestamp}_${random4}`
  └─ Returns: unique ID string

**Use:** Generate unique userId and chatId values
```

---

### 6.4 Nodemailer Service
```
sendMail({ to, subject, text, html })
  └─ Sends email via SMTP

**Status:** Currently commented out in signup
**Purpose:** OTP delivery (can be enabled)
```

---

## 7. Complete Request Flow Examples

### 7.1 User Signup Flow
```
[Client] 
  │
  │ 1. POST /signup {username, email, password}
  ▼
[Server: isAuthenticated? NO → allow]
  │
  ├─ Validate input
  ├─ Check email uniqueness
  ├─ Hash password
  ├─ Generate OTP (6-digit)
  ├─ Save OTP document
  │
  └─ Response: {success: true, redirectedTo: "verify-otp"}
  │
[Client]
  │
  │ 2. POST /verify-otp {email, otp}
  ▼
[Server: isAuthenticated? NO → allow]
  │
  ├─ Find OTP by email+otp
  ├─ Generate RSA keys
  ├─ Generate userId
  ├─ Create User
  ├─ Generate JWT (7d)
  ├─ Set httpOnly cookie
  ├─ Delete OTP
  │
  └─ Response: {success: false, privateKey: "..."}
  │
[Client: Store privateKey for encryption]
  │
  │ 3. POST /login {email, password}
  ▼
[Server: isAuthenticated middleware → verify JWT]
  │
  ├─ Find user by email
  ├─ Verify password
  ├─ Generate new JWT (refresh)
  ├─ Set httpOnly cookie
  │
  └─ Response: {success: true, redirectedTo: "/chat"}
```

---

### 7.2 Fetching Chat List Flow
```
[Client: Load chat page]
  │
  │ 1. GET /me (check auth)
  ▼
[Server: isAuthenticated]
  │
  ├─ Verify JWT cookie
  └─ Response: {status: true, user: {userId, ...}}
  │
[Client: authenticated, proceed]
  │
  │ 2. POST /contacts
  ▼
[Server: isAuthenticated]
  │
  ├─ Find all Chat where participant=userId
  ├─ Get user.contacts for name mapping
  ├─ Separate group/peer chats
  ├─ For peers: fetch other user's email
  ├─ Merge & sort by updatedAt desc
  │
  └─ Response: {success: true, chats: [...]}
  │
[Client: Display chat list]
```

---

### 7.3 Loading Messages Flow
```
[Client: Click on chat]
  │
  │ 1. POST /contact {roomId}
  ▼
[Server: isAuthenticated]
  │
  ├─ Find Chat by chatId=roomId
  ├─ Filter out current user
  ├─ Look up saved contact names
  │
  └─ Response: 
      - For peer: {contactName, type:"peer"}
      - For group: {contactList[], roomName, type:"group"}
  │
[Client: Show chat header]
  │
  │ 2. POST /messages {contactId, skip:0}
  ▼
[Server: isAuthenticated]
  │
  ├─ roomId = getRoomId(userId, contactId)
  ├─ Query Message.find({roomId})
  │    .sort(-createdAt).skip(0).limit(50)
  ├─ Transform: add sendByMe, format time
  ├─ Reverse (oldest first for display)
  │
  └─ Response: {success: true, messages: [...]}
  │
[Client: Display message history]
```

---

### 7.4 Real-time Messaging Flow
```
[Client A: Open chat with B]
  │
  │ Socket.IO connection (with JWT)
  ▼
[Server: isSocketAuthenticated]
  ├─ Verify token
  ├─ socket.user = {userId, email, username}
  │
  ├─ OnlineUser.add(userId, socket.id)
  ├─ handleConnectContactRoom:
  │   ├─ socket.join(userId) ← personal room
  │   └─ socket.join(peer chat rooms)
  │
  └─ socket.on('message', ...) registered
  │
[Client B also connected → in same room]
  │
[Client A] 
  │  socket.emit('message', {roomId, message})
  ▼
[Server: socketMessageHandler]
  ├─ Validate roomId
  ├─ Create message object
  ├─ Message.create()
  ├─ Chat.updateOne({lastMessage, lastMessageSender})
  │
  ├─ socket.to(roomId).emit('message', message)
  │      │
  │      └─ [Client B receives message in real-time]
  │
  └─ (Client A retains message locally)
```

---

## 8. Security Features

### 8.1 Authentication & Authorization
- **JWT Tokens:** 7-day expiry, signed with JWT_SECRET
- **httpOnly Cookies:** Prevent XSS token theft
- **Socket Auth:** Same JWT verification for WebSocket
- **Route Protection:** `isAuthenticated` middleware on sensitive routes
- **User Context:** `req.user.userId` from decoded token

### 8.2 Data Protection
- **Password Hashing:** Argon2 (not bcrypt)
- **End-to-End Encryption:** Messages store encrypted payloads
- **RSA Key Pair:** Generated at signup, private key only to user
- **HMAC/CSP:** (Not implemented, would need addition)

### 8.3 Input Validation
- **Server-side:** UserValidator validates email, password, username
- **Async Handler:** Wraps controllers, catches errors
- **Room Validation:** validateUserId prevents format injection

---

## 9. Environment Variables Required

```
PORT=3000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret-key>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<service-email>
EMAIL_PASS=<app-password>
```

---

## 10. Database Collections Summary

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User accounts | userId, email, username, password, publicKey, contacts, lastSeen |
| `chats` | Conversation rooms | chatId, type, participants, lastMessage, lastMessageSender |
| `messages` | Individual messages | roomId, senderId, encryptedPayload, createdAt |
| `otps` | OTP temporary storage | email, otp, username, password (hashed) |

---

## 11. State Management Patterns

### 11.1 Server-side State
- **OnlineUser Service:** In-memory Map tracking online socket connections
  - Cleared on server restart
  - Updated on connect/disconnect
- **Socket Rooms:** Socket.IO manages room membership automatically
  - User joins personal room (userId)
  - User joins all peer chat rooms on connect

### 11.2 Client-side State (Expected)
- **Private Key:** Stored client-side (not sent after initial delivery)
- **Token:** Managed via httpOnly cookie (automatic)
- **Messages:** Cached locally after fetch
- **Chat List:** Cached locally

---

## 12. Error Handling Strategy

- **asyncHandler Utility:** Wraps async controllers, forwards errors to Express error handler
- **Validation Errors:** 400 with `{success: false, message: "..."}`
- **Auth Failures:** 401 with `{status: false, message: "..."}`
- **Socket Errors:** `next(new Error("Unauthorized"))` triggers disconnect
- **Not Found:** Thrown errors caught by asyncHandler (should be caught with try/catch)
- **Server Errors:** Unhandled errors → Express default 500

---

## 13. Potential Improvements & TODOs

1. **OTP Email Delivery:** Uncomment nodemailer.service.js call in signup
2. **OTP Expiry:** Add TTL index on OTP collection (expires after 10 min)
3. **Rate Limiting:** Add rate limiting on auth routes
4. **Refresh Tokens:** JWT only has 7d expiry, could add refresh token rotation
5. **Message Encryption:** Client-side encryption not implemented (server stores plaintext in cipherText field)
6. **Typing Indicators:** Socket event for "typing"
7. **Message Read Receipts:** Add read status to messages
8. **File Attachments:** Support for media uploads
9. **Group Management:** Create/ delete groups, add/remove participants
10. **Search:** Search messages or contacts
11. **Pagination Cursor:** Use cursor-based instead of skip for large histories
12. **Online Status Broadcast:** Broadcast "user-online"/"user-offline" to contacts

---

## 14. Technology Stack

- **Backend:** Node.js, Express.js
- **Real-time:** Socket.IO
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT + httpOnly cookies
- **Password Hashing:** Argon2
- **Encryption:** RSA (for key exchange), AES? (client-side expected)
- **Email:** Nodemailer (commented out)
- **Views:** EJS (for chat page)
- **CORS:** Configured for specific origins
- **Validation:** Custom UserValidator

---

## 15. CORS Configuration

```javascript
Allowed Origins:
  - http://localhost:5173
  - http://10.94.226.242:5173

Applied to:
  - Express routes (app.use(cors))
  - Socket.IO server (io = new Server(server, { cors }))
```

---

## End of Workflow Documentation
