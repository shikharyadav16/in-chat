# Expected Routes & Workflow

## Overview

This document outlines the **expected** RESTful routes and workflow for a production-ready real-time chat application, based on the current codebase. It compares **what should exist** vs **what exists now**.

---

## 1. Expected Route Structure

### 1.1 Authentication Routes

```
POST   /api/auth/signup
POST   /api/auth/verify-otp
POST   /api/auth/login
GET    /api/auth/refresh        ← missing
POST   /api/auth/logout         ← missing
GET    /api/auth/me             ← missing (exists as /me, not under /auth)
```

**Current vs Expected**:
- Routes are at root (`/signup`, `/login`) instead of `/api/auth/` prefix — should be prefixed in production
- `/me` has no auth middleware in `index.js` but should always be protected
- Missing `/auth/refresh` and `/auth/logout` (P0)

### 1.2 User Routes

```
GET    /api/users               ← list/search users (exists as /users/search?query=)
GET    /api/users/:userId       ← get user profile     ← missing
PUT    /api/users/profile       ← update own profile   ← missing
POST   /api/users/block         ← block a user         ← missing
POST   /api/users/report        ← report a user        ← missing
GET    /api/users/online        ← get online contacts  ← missing
```

**Current**:
- `GET /users/search?query=` — searches users by `username` or `email` prefix match, returns up to 10 results with `{ userId, username, email }`
- Search uses case-insensitive prefix match (`^query`)
- Missing: full user detail route `GET /users/:userId`

### 1.3 Chat Routes

```
POST   /api/chats               ← create new chat (peer or group) ← missing
GET    /api/chats/direct/:userId    ← check existing 1:1 chat
    Current: /chats/direct/:userId ✅ exists
         Returns { chatId, isNew, contactName }
         Queries: User.findOne({ targetId }) — BUG: field is userId, not targetId
         Queries: Chat.findOne({ isGroup, participants: {$all: [userId, targetId]} })
         — BUG: Chat model uses type: "peer", not isGroup

GET    /api/chats/group/:roomId     ← get group chat details
    Current: /chats/group/:roomId ✅ exists
         Returns { chatId, chatName }
         Queries: Chat.findOne({ chatId: roomId, type: "group" }) — OK

PUT    /api/chats/:chatId       ← update group details   ← missing
DELETE /api/chats/:chatId       ← delete/exit chat       ← missing
POST   /api/chats/:chatId/participants ← manage members   ← missing
POST   /api/chats/:chatId/mute ← mute chat                ← missing
POST   /api/chats/:chatId/pin  ← pin chat                 ← missing
```

**Key issues in current `/chats/direct/:userId`**:
- Queries `User.findOne({ targetId })` but User model has no `targetId` field — should be `{ userId: targetId }`
- Queries `Chat.findOne({ isGroup: false, ... })` but Chat model uses `type: "peer"` not `isGroup` — always returns null
- These bugs mean this route does not work correctly

### 1.4 Contact Routes

```
GET    /api/contacts            ← get all chats with participants
    Current: GET /contacts ✅ exists (renamed from POST to GET)
         Returns sorted list of group + peer chats with:
         { roomId, type, name, participants, sentBy, lastMessage, lastMessageTime, email?, contactId? }

POST   /api/contact             ← get specific room participants
    Current: POST /contact ❌ no route defined
         — handler handleGetContactName exists in controller but is NOT routed in contact.route.js
```

### 1.5 Message Routes

```
GET    /api/messages/:roomId       ← paginated messages for a room
    Current: GET /messages/:roomId ✅ exists
         Accepts skip in body (anti-pattern — should be query param)
         Returns array of messages with sendByMe flag and formatted time
         Limit: 50, skip-based pagination

PUT    /api/messages/:messageId ← edit message       ← missing
DELETE /api/messages/:messageId ← delete message     ← missing
POST   /api/messages/:messageId/seen ← mark as read  ← missing
```

**Issues**:
- `skip` passed in request body instead of query param — violates REST conventions
- No cursor-based pagination
- `messageId` is passed as string but Message model doesn't auto-generate one in save

### 1.6 System Routes

```
GET    /health                  ← health check         ← missing
GET    /health/db               ← database health      ← missing
GET    /health/redis            ← Redis health         ← missing
GET    /metrics                 ← Prometheus metrics   ← missing
```

---

## 2. Expected Socket Events

### 2.1 Current Socket Events

| Event | From | To | Payload | Works? |
|-------|------|----|---------|--------|
| `connection` (auto) | Client | Server | JWT in handshake | ✅ |
| `message` | Client | Server | `{ roomId, message }` (encrypted) | ✅ |
| `message` (broadcast) | Server | Client | `{ messageId, roomId, senderId, encryptedPayload }` | ✅ |
| `online-status` | Client | Server | `{ contactId }` | ✅ |
| `online-status` (response) | Server | Client | `{ status, lastSeen }` | ✅ |
| `disconnect` (auto) | Client | Server | - | ✅ |

### 2.2 Missing Socket Events

| Event | From | To | Payload | Priority |
|-------|------|----|---------|----------|
| `typing` | Client | Server | `{ roomId, isTyping }` | P1 |
| `typing` (broadcast) | Server | Client | `{ roomId, userId, isTyping }` | P1 |
| `message-read` | Client | Server | `{ messageId }` | P1 |
| `message-read` (broadcast) | Server | Client | `{ messageId, readerId }` | P1 |
| `message-sent` (ack) | Server | Client | `{ messageId }` | P1 |
| `chat-updated` | Server | Client | `{ chatId, lastMessage, updatedAt }` | P1 |
| `presence-update` | Server | Client | `{ contactId, status }` | P2 |
| `new-chat` | Server | Client | `{ chatId, type, participants }` | P2 |

---

## 3. Workflow Diagrams

### 3.1 Current Signup → Login Flow

```
Client                           Server
  │                                │
  ├──── POST /signup ────────────►│
  │     {username, email, password}│
  │                                ├─ Validate input
  │                                ├─ Check email exists
  │                                ├─ Generate 6-digit OTP
  │                                ├─ Hash password (argon2)
  │                                ├─ Save OTP record
  │                                │  (send email ← COMMENTED OUT)
  │◄── 200 {success, redirectedTo}─┤
  │                                │
  ├──── POST /verify-otp ────────►│
  │     {email, otp}               │
  │                                ├─ Find OTP record
  │                                ├─ Generate RSA key pair
  │                                ├─ Create User
  │                                ├─ Set JWT cookie
  │                                ├─ Delete OTP
  │◄── 200 {success, message,      │
  │     privateKey}                │
  │                                │
  ├──── POST /login ─────────────►│
  │     {email, password}          │
  │                                ├─ Find user, verify password
  │                                ├─ Set new JWT cookie
  │◄── 200 {success, redirectedTo}─┤
  │                                │
  ├──── GET /me ─────────────────►│
  │                                 │
  │◄── 200 {sucess, user}          │  (note: typo "sucess")
```

### 3.2 Expected Signup → Login Flow (improved)

```
Client                           Server
  │                                │
  ├──── POST /api/auth/signup ───►│
  │                                ├─ Validate + check + generate OTP
  │                                ├─ Send email (SMTP)
  │                                ├─ Set OTP TTL 10 min
  │◄── 200 {success, expiresIn,    │
  │     redirectTo}                │
  │                                │
  ├──── POST /api/auth/verify-otp ─│
  │                                ├─ Verify OTP (timing-safe)
  │                                ├─ Generate RSA + userId
  │                                ├─ Create User (+ emailVerified)
  │                                ├─ Issue access token (15m) + refresh token (90d)
  │                                ├─ Set both cookies
  │◄── 201 {success, user,         │
  │     privateKey, tokens}        │
  │                                │
  ├──── POST /api/auth/login ─────►│
  │                                ├─ Verify password
  │                                ├─ Issue both tokens
  │                                ├─ Log login attempt
  │◄── 200 {success, redirectedTo}─│
  │                                │
  ├──── GET /api/auth/me ─────────►│
  │                                 ├─ Verify JWT → 200
  │                                 └─ No cookie → 401
  │                                 │
  │                                 │ (15 min later: access token expired)
  │                                 │
  ├──── POST /api/auth/refresh ───►│
  │                                ├─ Verify refresh token
  │                                ├─ Rotate refresh token
  │                                ├─ Issue new access token
  │◄── 200 {token}                 │
  │                                │
  ├──── POST /api/auth/logout ────►│
  │                                ├─ Clear cookies
  │                                ├─ Revoke refresh token
  │◄── 200 {success}               │
```

### 3.3 Current Chat/Messaging Flow

```
Client                           Server
  │                                │
  ├──── GET /chat (protected) ───►│
  │◄── {contacts, userId}         │  (JSON, not EJS render)
  │                                │
  ├──── GET /contacts (protected) ─►│
  │                                ├─ Find Chat.find({participants: userId})
  │                                ├─ Separate group/peer
  │                                ├─ Lookup other user's email/username
  │                                ├─ Merge, sort by lastMessageTime
  │◄── {success, chats: [...]}    │
  │                                │
  ├──── GET /chats/direct/:userId ─►│
  │                                ├─ Find User.findOne({ targetId }) ← BUG
  │                                ├─ Find Chat.findOne({ isGroup: false }) ← BUG
  │◄── {success, chatId,          │
  │     isNew, contactName}       │  (currently broken)
  │                                │
  ├──── GET /chats/group/:roomId ─►│
  │                                ├─ Find Chat.findOne({ chatId, type:"group" })
  │◄── {success, chatId, chatName} │
  │                                │
  ├──── GET /messages/:roomId ───►│
  │     body: {skip} (anti-pattern)│
  │                                ├─ Query Message.find({roomId})
  │                                ├─ .sort(-createdAt).skip(N).limit(50)
  │                                ├─ Add sendByMe, format time
  │                                ├─ Reverse array
  │◄── {success, messages: [...]} │
  │                                │
  │── socket.emit("online-status",│
  │                {contactId}) ──►│
  │                                ├─ Check OnlineUser.has(contactId)
  │◄── socket.emit({status,       │
  │     lastSeen})                │
  │                                │
  │── socket.emit("message",      │
  │                {roomId, msg})─►│
  │                                ├─ Validate roomId
  │                                ├─ Create message object
  │                                ├─ Save to DB
  │                                ├─ Chat.updateOne(lastMessage)
  │                                ├─ socket.to(roomId).emit("message", msg)
  │                                  └──► other clients receive
```

---

## 4. Bugs & Issues in Current Routes

### 4.1 Critical

1. **`GET /chats/direct/:userId`** — Always returns user-not-found
   - `User.findOne({ targetId })` should be `User.findOne({ userId: targetId })`
   - `Chat.findOne({ isGroup: false, ... })` should be `Chat.findOne({ type: "peer", ... })`

2. **`POST /contact`** has no route — `handleGetContactName` is exported but never mapped

3. **`POST /signup`** — OTP email sending is commented out

4. **`GET /me`** — No `isAuthenticated` middleware applied; checks cookie internally. Also typo: returns `sucess` (missing `c`)

5. **`GET /messages/:roomId`** — Accepts `skip` in request body on a GET request (should be query param)

6. **`handleGetContactName`** — References `chat.participants` twice (line 93 and 100), but line 93 sets `chat` to `chatRoom.participants` (array), then tries `.participants.filter()` on it. Would throw.

### 4.2 Architectural

7. **`/chat` returns JSON** instead of rendering EJS — either remove EJS setup or actually render the template

8. **Routes not prefixed** — All routes are at root path. Should use `/api/v1/` prefix for clean API versioning

9. **chat.route.js not imported** in `index.js` — The file exists (`routes/chat.route.js`) but is not required or mounted in `index.js`

---

## 5. What's Missing vs What's Done

### Done ✅
- [x] Signup with OTP generation (email sending commented out)
- [x] OTP verification with RSA key generation + JWT
- [x] Login with Argon2 password verification + JWT cookie
- [x] Auth check via `/me` (cookie-based)
- [x] Get all user chats (peer + group) via `GET /contacts`
- [x] Search users by prefix via `GET /users/search?query=`
- [x] Get paginated messages from a room via `GET /messages/:roomId`
- [x] Check direct chat existence via `GET /chats/direct/:userId` (BUGGY)
- [x] Get group details via `GET /chats/group/:roomId`
- [x] Real-time message sending via Socket.IO
- [x] Online status check via socket
- [x] Presence tracking (connect/disconnect)

### Missing ❌
- [ ] Fix bugs in `handleGetDirectChats` (wrong query fields)
- [ ] Fix bug in `handleGetContactName` (double participants access)
- [ ] Add route for `POST /contact` → `handleGetContactName`
- [ ] Mount `chatRoutes` in `index.js`
- [ ] Fix OTP email sending (uncomment nodemailer call)
- [ ] Refresh token flow (`/refresh`, `/logout`)
- [ ] Create new chat (`POST /chats`)
- [ ] Message edit/delete
- [ ] Read receipts
- [ ] Typing indicators
- [ ] File attachments
- [ ] Health check endpoint
- [ ] Rate limiting
- [ ] Unified error/response format
- [ ] `/me` returns `sucess` → `success` (typo)
- [ ] `messages/:roomId` skip → query param
- [ ] `/api/` prefix
