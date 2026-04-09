# API Routes Documentation

## Overview

This document provides a complete reference for all HTTP and Socket.IO routes in the chat application, including **current implementation status** and **expected additions**.

---

## Table of Contents

1. [Authentication Routes](#authentication-routes)
2. [Main Routes](#main-routes)
3. [Contact Routes](#contact-routes)
4. [Chat Routes](#chat-routes)
5. [Message Routes](#message-routes)
6. [Missing Routes](#missing-routes)
7. [Socket Events](#socket-events)

---

## Authentication Routes

| Route | Method | Auth | Body | Controller | Status |
|-------|--------|------|------|------------|--------|
| `/signup` | POST | No | `username`, `email`, `password` | `handlePostSignup` | Implemented (OTP email commented out) |
| `/verify-otp` | POST | No | `email`, `otp` | `verifySignupOTP` | Implemented |
| `/login` | GET | No | - | - (renders EJS) | Implemented |
| `/login` | POST | No | `email`, `password` | `handlePostLogin` | Implemented |
| `/me` | GET | No | - | `checkAuth` | Implemented |
| `/refresh` | POST | No | - | `handleRefreshToken` | Implemented |
| `/logout` | POST | No | - | `handleLogout` | Implemented |
| `/reset-password` | POST | No | `email` | `handleResetPassword` | Implemented |
| `/verify-reset-otp` | POST | No | `email`, `otp`, `newPassword` | `handleVerifyResetOTP` | Implemented |

**File**: `routes/auth.routes.js`, `controllers/auth.controller.js`

---

## Contact Routes

| Route | Method | Auth | Body/Params | Controller | Status |
|-------|--------|------|-------------|------------|--------|
| `/contacts` | GET | Yes | - | `handleGetContacts` | Implemented |
| `/users/search` | GET | Yes | `?query=` | `handleGetNewContact` | Implemented |

**File**: `routes/contact.route.js`, `controllers/contact.controller.js`

---

## Chat Routes

| Route | Method | Auth | Body/Params | Controller | Status |
|-------|--------|------|-------------|------------|--------|
| `/chats/direct/:userId` | GET | Yes | `userId` (param) | `handleGetDirectChats` | Implemented (mounted & protected) |
| `/chats/group/:roomId` | GET | Yes | `roomId` (param) | `handleGetGroupChats` | Implemented (mounted & protected) |
| `/chats/create` | POST | Yes | `participantIds[]`, `type: 'peer'\|'group'`, `groupName?` | `handleCreateNewChat` | Implemented |

**Note**: Chat update (`PUT /chats`) functionality is handled via Socket.IO (`updateChat` event), not REST.

**File**: `routes/chat.route.js`, `controllers/chat.controller.js`

---

## Message Routes

| Route | Method | Auth | Body/Params | Controller | Status |
|-------|--------|------|-------------|------------|--------|
| `/messages/:roomId` | GET | Yes | `?skip=` (query) | `handleGetChatMessages` | Implemented |
| `/chats` | PUT | Yes | `lastMessage`, `lastMessageSender`, `roomId` | `updateChat` | **Socket-side only** (no REST route) |

**Note**: Message sending, chat creation, and read receipts are handled via **Socket.IO**, not REST. See socket events below. `GET /messages/:roomId` correctly uses `skip` as a query parameter (fixed from previous body anti-pattern).

**File**: `routes/message.route.js`, `controllers/message.controller.js`

---

## Missing Routes

### Chat Management

| Route | Method | Body | Description | Priority |
|-------|--------|------|-------------|----------|
| `PUT /chats/:chatId` | PUT | `groupName?`, `avatar?`, `description?` | Update group details | P1 |
| `DELETE /chats/:chatId` | DELETE | - | Delete/exit chat | P1 |
| `POST /chats/:chatId/participants` | POST | `userId`, `action: 'add'\|'remove'` | Add/remove group participants | P1 |
| `POST /chats/:chatId/mute` | POST | `mutedUntil?` | Mute/unmute notifications | P2 |
| `POST /chats/:chatId/pin` | POST | `pinned: boolean` | Pin/unpin chat | P2 |

### Message Management

| Route | Method | Body | Description | Priority |
|-------|--------|------|-------------|----------|
| `PUT /messages/:messageId` | PUT | `content` | Edit message | P1 |
| `DELETE /messages/:messageId` | DELETE | - | Delete message (soft delete) | P1 |
| `POST /messages/:messageId/seen` | POST | - | Mark message as seen (REST) | P1 |

### User Management

| Route | Method | Body | Description | Priority |
|-------|--------|------|-------------|----------|
| `GET /users/:userId` | GET | - | Get user profile | P1 |
| `PUT /users/profile` | PUT | `username?`, `bio?`, `avatar?` | Update own profile | P2 |
| `POST /users/block` | POST | `userId` | Block user | P2 |
| `POST /users/report` | POST | `userId`, `reason` | Report user | P2 |
| `GET /users/online` | GET | - | Get online contacts (batch) | P1 |

### File Attachments

| Route | Method | Body | Description | Priority |
|-------|--------|------|-------------|----------|
| `POST /uploads` | POST | `file`, `roomId` | Upload file/image/audio | P2 |
| `GET /uploads/:fileId` | GET | - | Download/view attachment | P2 |
| `DELETE /uploads/:fileId` | DELETE | - | Delete file | P2 |

### System

| Route | Method | Description | Priority |
|-------|--------|-------------|----------|
| `GET /health` | GET | Health check (DB status) | P1 |

---

## Socket Events

### Currently Implemented

| Event | Direction | Data | Description | Status |
|-------|-----------|------|-------------|--------|
| `connection` | Client → Server | (JWT in auth) | Authenticate socket, join personal room `{userId}` and all group chat rooms | Implemented |
| `message` | Client → Server | `{ message, roomId, receiverId? }` | Send encrypted message. If `receiverId` provided, creates/uses peer room for existing/new chat | Implemented |
| `message-sent` | Server → Client | `{ message object }` | Acknowledge message saved, echoes back to sender | Implemented |
| `message` | Server → Client | `{ message object }` | Forward to receiver (by userId socket) or broadcast to room members (group peer rooms) | Implemented |
| `join-chat` | Client → Server | `{ roomId }` | User clicks on a chat, joins the socket room | Implemented |
| `leave-chat` | Client → Server | `{ roomId }` | User leaves chat, leaves the socket room | Implemented |
| `message-read` | Client → Server | `{ contactId, userId, type, roomId }` | Mark messages as read | Implemented |
| `online-status` | Client → Server | `{ contactId }` | Check if contact is online | Implemented |
| `online-status` | Server → Client | `{ status: "online" \| "offline", lastSeen? }` | Return online status | Implemented |
| `disconnect` | Client → Server | - | Update `lastSeen`, remove from online users | Implemented |

### Socket Flow Details

**Message Flow (`message` event):**
1. Client sends `{ message, roomId, receiverId? }`
2. If `receiverId` provided → computes peer room ID, sets `roomId`
3. Updates chat `lastMessage` and `lastMessageSender` via `updateChat()`
4. Saves message to DB via `saveMessages()`
5. If `receiverId`: looks up receiver's socket IDs, emits `message` to each
6. If no `receiverId`: broadcasts `message` to room via `socket.to(roomId).emit()`
7. Always emits `message-sent` back to sender

**Connection Flow:**
- On connect: socket joins the user's personal room `{userId}` + all group chat rooms
- On disconnect: updates `lastSeen` in DB, removes from online tracking
- `handleConnectContactRoom` only auto-joins **group** chats, not peer chats

### Missing Socket Events

| Event | Direction | Description | Priority |
|-------|-----------|-------------|----------|
| `typing` | Client → Server / Server → Client | Typing indicator | P1 |
| `message-read` | Server → Client | Broadcast read receipt to sender (currently only DB update, no emit) | P1 |
| `chat-updated` | Server → Client | Reorder chat list on new message | P1 |
| `presence-update` | Server → Client | Notify contacts about online/offline status change | P1 |

### Socket Events That Need REST Fallback

| Event | Why Need REST? | Priority |
|-------|---------------|----------|
| `message-read` | Need history/initial load of seen status for offline users | P1 |
| Chat creation (via `message` with `receiverId`) | Some clients may need a dedicated REST `POST /chats` endpoint | P0 |

---

## Route Summary

| Category | Implemented | Missing | Total Needed |
|----------|-------------|---------|-------------|
| Authentication | 9 | 0 | 9 |
| Main | 0 (removed - SPA frontend) | 0 | 0 |
| Contact | 2 | 0 | 2 |
| Chat | 3 REST + 1 via socket | 0 REST | 3+ |
| Message | 1 REST + 3 via socket | 0 | 4+ |
| User | 0 | 5 | 5 |
| File | 0 | 3 | 3 |
| System | 0 | 1 | 1 |
| Socket Events | 10 events | 4 events | 14 events |

**Total HTTP routes**: ~15 live, ~9 missing  
**Total Socket events**: 10 implemented, 4 missing

---

## Currently Implemented Route Map

```
POST   /signup                    → handlePostSignup
POST   /verify-otp                → verifySignupOTP
POST   /login                     → handlePostLogin
GET    /me                        → checkAuth
POST   /refresh                   → handleRefreshToken
POST   /logout                    → handleLogout
POST   /reset-password            → handleResetPassword
POST   /verify-reset-otp          → handleVerifyResetOTP

GET    /contacts                  → handleGetContacts           [protected]
GET    /users/search?query=       → handleGetNewContact         [protected]

GET    /chats/direct/:userId      → handleGetDirectChats        [protected]
GET    /chats/group/:roomId       → handleGetGroupChats         [protected]
POST   /chats/create              → handleCreateNewChat         [protected]

GET    /messages/:roomId          → handleGetChatMessages       [protected]
```

---

## What's Next

Prioritized list of recommended next steps based on current state.

### Phase 1: Critical Fixes

1. **Fix `message-read` socket event** — Currently only updates DB, doesn't broadcast to sender. Add `io.emit()` so the sender gets real-time read receipt notification.

### Phase 2: Real-time UX

2. **Typing indicators** — `typing` socket event (both directions)
3. **Chat list reorder** — `chat-updated` socket event so the contact list reorders on new message
4. **Presence updates** — Emit `presence-update` to contacts when user comes online/goes offline

### Phase 3: Architecture Cleanup

5. **Add `/api/v1/` prefix** — Clean API versioning for all routes
6. **`GET /health`** — Health check endpoint (DB status, server uptime)
7. **`GET /users/online`** — Batch online status for contact list
8. **Chat Management REST endpoints** — Add REST fallbacks for chat operations:
   - `PUT /chats/:chatId` - Update group details
   - `DELETE /chats/:chatId` - Delete/exit chat
   - `POST /chats/:chatId/participants` - Add/remove participants
9. **Message Management REST endpoints** — Add REST fallbacks for message operations:
   - `PUT /messages/:messageId` - Edit message
   - `DELETE /messages/:messageId` - Delete message (soft delete)
   - `POST /messages/:messageId/seen` - Mark message as seen
10. **User Management REST endpoints** — Add user profile and management:
    - `GET /users/:userId` - Get user profile
    - `PUT /users/profile` - Update own profile
    - `POST /users/block` - Block user
    - `POST /users/report` - Report user
11. **File Attachment endpoints** — Add file upload/download:
    - `POST /uploads` - Upload file/image/audio
    - `GET /uploads/:fileId` - Download/view attachment
    - `DELETE /uploads/:fileId` - Delete file

### Architecture Notes

- Auth routes at root (`/login`). Plan `/api/v1/auth/login` for API versioning
- Core messaging runs on **Socket.IO**, not REST. Message sending, chat creation, read receipts all socket-based
- Auto-join on connect: personal room + **group chats only** (peer chats need explicit `join-chat`). This means peer chat messages won't arrive if the receiver hasn't explicitly joined the room
- OTP model has TTL index (`expires: 600` = 10 min auto-delete), `isUsed` flag for password reset flow
