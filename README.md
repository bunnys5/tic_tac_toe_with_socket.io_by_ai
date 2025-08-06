# Multiplayer Tic Tac Toe

A real-time multiplayer Tic Tac Toe game built with Next.js, Socket.IO, and TypeScript. Play online with friends by sharing a game ID.

## Features

- Real-time gameplay using Socket.IO
- Create new games and join existing ones with game IDs
- Player status indicators (connected/disconnected)
- Turn-based gameplay with visual indicators
- Spectator mode for additional viewers
- Responsive design with Tailwind CSS
- Deployable to Vercel

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Socket.IO
- **Deployment**: Vercel

## How to Play

1. Create a new game or join an existing one with a game ID
2. Share the game ID with a friend to play together
3. The first player to join is X, the second is O
4. Take turns placing your symbol on the board
5. The first player to get three in a row (horizontally, vertically, or diagonally) wins
6. If all cells are filled without a winner, the game ends in a draw

## Local Development

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

This project is configured for easy deployment to Vercel.

1. Push your code to a GitHub repository
2. Import the project in the Vercel dashboard
3. Deploy with default settings

Alternatively, you can deploy directly from the command line:

```bash
npm install -g vercel
vercel
```

## Project Structure

- `src/app/` - Next.js app router pages and API routes
- `src/components/` - React components
- `src/types/` - TypeScript type definitions
- `src/app/api/socket/` - Socket.IO server implementation
- `src/app/game/[id]/` - Game page with real-time gameplay

## License

MIT