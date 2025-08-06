import { NextRequest } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { GameState } from '../../../types/game';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

// Game rooms storage
const games = new Map<string, GameState>();

export function GET(req: NextRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    
    // Create a new Socket.IO server
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });
    
    // Store the Socket.IO server instance
    res.socket.server.io = io;

    // Socket.IO event handlers
    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle joining a game
      socket.on('joinGame', ({ gameId }) => {
        console.log(`${socket.id} joining game: ${gameId}`);
        
        // Join the socket room for this game
        socket.join(gameId);
        
        // Initialize game state if it doesn't exist
        if (!games.has(gameId)) {
          games.set(gameId, {
            board: Array(9).fill(null),
            currentPlayer: 'X',
            winner: null,
            isDraw: false,
            players: { X: null, O: null },
            spectators: 0,
          });
        }
        
        // Get current game state
        const gameState = games.get(gameId)!;
        
        // Assign player to X or O if available
        if (!gameState.players.X) {
          gameState.players.X = socket.id;
        } else if (!gameState.players.O) {
          gameState.players.O = socket.id;
        } else {
          // If both X and O are taken, this player is a spectator
          gameState.spectators += 1;
        }
        
        // Update game state
        games.set(gameId, gameState);
        
        // Emit updated game state to all clients in this game
        io.to(gameId).emit('gameState', gameState);
        
        // Handle disconnection
        socket.on('disconnect', () => {
          console.log(`Client disconnected: ${socket.id}`);
          
          if (games.has(gameId)) {
            const gameState = games.get(gameId)!;
            
            // Remove player from game
            if (gameState.players.X === socket.id) {
              gameState.players.X = null;
            } else if (gameState.players.O === socket.id) {
              gameState.players.O = null;
            } else {
              // Decrement spectator count
              gameState.spectators = Math.max(0, gameState.spectators - 1);
            }
            
            // Update game state
            games.set(gameId, gameState);
            
            // Emit updated game state
            io.to(gameId).emit('gameState', gameState);
            
            // Clean up empty games after some time
            if (!gameState.players.X && !gameState.players.O && gameState.spectators === 0) {
              setTimeout(() => {
                // Double check that the game is still empty
                const currentState = games.get(gameId);
                if (currentState && !currentState.players.X && !currentState.players.O && currentState.spectators === 0) {
                  games.delete(gameId);
                  console.log(`Game ${gameId} removed due to inactivity`);
                }
              }, 60000); // 1 minute
            }
          }
        });
      });

      // Handle making a move
      socket.on('makeMove', ({ gameId, index, player }) => {
        if (!games.has(gameId)) return;
        
        const gameState = games.get(gameId)!;
        
        // Validate move
        if (
          gameState.winner || 
          gameState.isDraw || 
          gameState.currentPlayer !== player || 
          gameState.board[index] !== null ||
          (player === 'X' && gameState.players.X !== socket.id) ||
          (player === 'O' && gameState.players.O !== socket.id)
        ) {
          return;
        }
        
        // Update board
        const newBoard = [...gameState.board];
        newBoard[index] = player;
        gameState.board = newBoard;
        
        // Check for winner
        const winPatterns = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
          [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
          [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        
        for (const pattern of winPatterns) {
          const [a, b, c] = pattern;
          if (
            newBoard[a] && 
            newBoard[a] === newBoard[b] && 
            newBoard[a] === newBoard[c]
          ) {
            gameState.winner = player;
            break;
          }
        }
        
        // Check for draw
        if (!gameState.winner && !newBoard.includes(null)) {
          gameState.isDraw = true;
        }
        
        // Switch current player if game is still ongoing
        if (!gameState.winner && !gameState.isDraw) {
          gameState.currentPlayer = player === 'X' ? 'O' : 'X';
        }
        
        // Update game state
        games.set(gameId, gameState);
        
        // Emit updated game state
        io.to(gameId).emit('gameState', gameState);
      });

      // Handle game reset
      socket.on('resetGame', ({ gameId }) => {
        if (!games.has(gameId)) return;
        
        const gameState = games.get(gameId)!;
        
        // Only allow players to reset the game
        if (socket.id !== gameState.players.X && socket.id !== gameState.players.O) {
          return;
        }
        
        // Reset game state
        gameState.board = Array(9).fill(null);
        gameState.currentPlayer = 'X';
        gameState.winner = null;
        gameState.isDraw = false;
        
        // Update game state
        games.set(gameId, gameState);
        
        // Emit updated game state
        io.to(gameId).emit('gameState', gameState);
      });
    });
  }

  return new Response('Socket.IO server is running', { status: 200 });
}