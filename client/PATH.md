## Project Structure

```
frontend/
│
├── public/
│   └── assets/               # static files (images, icons, fonts)
│
├── src/
│   │
│   ├── app/                 # app-level setup
│   │   ├── store.js         # global state (Redux/Zustand)
│   │   ├── socket.js        # socket connection setup
│   │   └── config.js        # environment configs
│   │
│   ├── features/            # main modules (IMPORTANT)
│   │   ├── auth/
│   │   │   ├── api.js
│   │   │   ├── authSlice.js
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   │
│   │   ├── chat/
│   │   │   ├── api.js
│   │   │   ├── chatSlice.js
│   │   │   ├── ChatLayout.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   └── ChatHeader.jsx
│   │   │
│   │   ├── contacts/
│   │   │   ├── api.js
│   │   │   ├── ContactList.jsx
│   │   │   └── ContactItem.jsx
│   │   │
│   │   └── profile/
│   │       ├── Profile.jsx
│   │       └── api.js
│   │
│   ├── components/          # reusable UI components
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Loader.jsx
│   │   ├── Avatar.jsx
│   │   └── Input.jsx
│   │
│   ├── layouts/             # page layouts
│   │   ├── MainLayout.jsx
│   │   └── AuthLayout.jsx
│   │
│   ├── pages/               # route-level pages
│   │   ├── Home.jsx
│   │   ├── ChatPage.jsx
│   │   └── NotFound.jsx
│   │
│   ├── hooks/               # custom hooks
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   └── useChat.js
│   │
│   ├── services/            # external communication
│   │   ├── axios.js         # API instance
│   │   ├── socketService.js # socket logic
│   │   └── encryption.js    # tweetnacl logic
│   │
│   ├── utils/               # helpers
│   │   ├── formatTime.js
│   │   ├── constants.js
│   │   └── validators.js
│   │
│   ├── styles/              # global styles
│   │   ├── index.css
│   │   └── variables.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```
## Usecase Table

| 📁 Directory         | 🧩 Purpose             | 🔥 What You Put Inside            | ⚡ Why It Matters                               |
| -------------------- | ---------------------- | --------------------------------- | ---------------------------------------------- |
| `public/`            | Static assets          | images, icons, fonts              | Directly served by browser, no bundling needed |
| `src/app/`           | App-level setup        | store, socket init, configs       | Central control of app (brain of frontend)     |
| `src/features/`      | Feature modules        | chat, auth, contacts, profile     | Keeps logic + UI grouped → scalable            |
| `features/auth/`     | Authentication logic   | login/signup UI, auth API, state  | Isolates login system cleanly                  |
| `features/chat/`     | Chat system            | messages UI, chat logic, API      | Core of your app (real-time handling)          |
| `features/contacts/` | Contacts handling      | contact list UI, APIs             | Keeps user relationships separate              |
| `features/profile/`  | User profile           | profile UI, update APIs           | Independent user management                    |
| `src/components/`    | Reusable UI            | Button, Modal, Input, Avatar      | Avoids duplication across app                  |
| `src/layouts/`       | Page structures        | MainLayout, AuthLayout            | Defines page skeletons                         |
| `src/pages/`         | Route-level pages      | Home, ChatPage, NotFound          | Maps to routes (React Router)                  |
| `src/hooks/`         | Custom logic hooks     | useAuth, useChat, useSocket       | Reusable logic without duplication             |
| `src/services/`      | External communication | axios, socket logic, encryption   | Clean separation from UI                       |
| `src/utils/`         | Helper functions       | formatTime, validators, constants | Small reusable utilities                       |
| `src/styles/`        | Global styling         | CSS files, variables              | Centralized design system                      |
| `App.jsx`            | Root component         | routing, layouts                  | Entry point of UI logic                        |
| `main.jsx`           | App bootstrap          | ReactDOM render                   | Starts your React app                          |


### Why This Structure is Powerful

1. **Feature-Based Architecture** (MOST IMPORTANT)

   Instead of:
   ```
   components/
   pages/
   ```

   We group by feature:
   ```
   features/chat/
   features/auth/
   ```

   👉 This makes scaling EASY when InChat grows.

2. **Clean Separation of Logic**
   - features/chat/ → chat logic + UI
   - services/ → API + sockets
   - hooks/ → reusable logic
   - components/ → pure UI

   👉 No messy mixing = easy debugging

3. **Real-Time Ready Design**

   You already use Socket.IO, so:
   - app/socket.js → connection setup
   - services/socketService.js → emit/listen logic
   - hooks/useSocket.js → React integration

   👉 This prevents socket chaos (very common mistake)

4. **Encryption Support** (Important for InChat 🔐)

   You already plan end-to-end encryption:
   - services/encryption.js

   👉 Keep ALL crypto logic isolated here
   👉 Never mix it inside components

### Example Flow (How Everything Connects)

When user sends message:
- MessageInput.jsx
  ↓
- useChat.js
  ↓
- chatSlice.js (update state)
  ↓
- socketService.js (emit message)
  ↓
- backend
  ↓
- socketService.js (receive message)
  ↓
- chatSlice.js (update UI)

👉 This pipeline is what real chat apps use.