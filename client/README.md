# InChat

A real-time chat application built with React and Socket.IO.

## Features

- User authentication (login, signup, OTP verification)
- Real-time messaging with Socket.IO
- Contact management
- Room-based chat system
- Responsive UI with sidebar and chat area
- Protected routes for authenticated users

## Tech Stack

- **Frontend**: React 19, React Router DOM
- **Build Tool**: Vite
- **Real-time Communication**: Socket.IO Client
- **Styling**: CSS
- **State Management**: React Context API
- **Linting**: ESLint

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── features/           # Feature-specific modules (auth, chat, contacts)
├── pages/              # Page components
├── layouts/            # Layout components
├── context/            # React context providers
├── app/                # Socket configuration and store
├── services/           # Service modules
└── utils/              # Utility functions
```

## Environment Variables

Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Backend

This frontend expects a backend server running on `http://localhost:3000` with:
- Authentication endpoints (`/login`, `/signup`, `/me`)
- Socket.IO server for real-time communication