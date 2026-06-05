# Nero Party

A listening party app where friends join, add songs, listen together, and crown a winning song.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A music API for search/playback (your choice — see PROMPT.md)

### Installation

```bash
# Install all dependencies
npm install

# Set up environment variables (no API keys required by default)
cp .env.example .env

# Set up the database
cd backend && npx prisma migrate dev && cd ..

# Start the development servers
npm run dev
```

This will start:
- Backend on `http://localhost:3000`
- Frontend on `http://localhost:5173`

## Project Structure

```
nero-party/
├── backend/          # Express + Socket.IO server
│   ├── prisma/       # Database schema & migrations
│   └── src/          # Server source code
└── frontend/         # React + Vite client
    └── src/          # Client source code
```

## Tech Stack

- **Backend:** Express.js, Prisma, Socket.IO
- **Frontend:** React, Vite, TailwindCSS
- **Database:** SQLite (local)
- **External API:** Music API of your choice (for song search and playbook)

## Setup Instructions for Nero Party

### Quick Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd nero-party

# Install dependencies for both frontend and backend
npm install

# Copy environment file
cp .env.example .env

# Set up database
cd backend && npx prisma migrate dev && cd ..

# Start the application
npm run dev
```

### What happens when you run `npm run dev`:
- Backend server starts on `http://localhost:3000` 
- Frontend development server starts on `http://localhost:5173`
- Database is automatically created (SQLite file)
- Both servers run concurrently with hot reloading

### First Time Usage:
1. Open `http://localhost:5173` in your browser
2. Create a new party or join an existing one
3. Add songs and start listening together!

### Notes:
- No external API setup required for basic functionality
- Data persists locally in SQLite database
- Multiple parties can run simultaneously
- Real-time synchronization via WebSocket
