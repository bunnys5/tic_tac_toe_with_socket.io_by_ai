'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import GameBoard from '../../../components/GameBoard';
import PlayerInfo from '../../../components/PlayerInfo';
import GameStatus from '../../../components/GameStatus';
import { GameState, Player } from '../../../types/game';

let socket: Socket;

export default function GamePage() {
  const params = useParams();

  if (!params?.id) {
    return <div>Invalid game ID</div>;
  }

  const gameId = params.id as string;

  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    isDraw: false,
    players: { X: null, O: null },
    spectators: 0,
  });
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize socket connection
    const socketInitializer = async () => {
      // We use relative URL here which will be resolved against the current host
      // This works both in development and production with Vercel
      socket = io('', {
        path: '/api/socket',
      });

      socket.on('connect', () => {
        console.log('Connected to socket server');
        setConnected(true);
        setPlayerId(socket.id || null);

        // Join the game room
        socket.emit('joinGame', { gameId });
      });

      socket.on('gameState', (state: GameState) => {
        setGameState(state);

        // Determine player symbol
        if (socket.id === state.players.X) {
          setPlayerSymbol('X');
        } else if (socket.id === state.players.O) {
          setPlayerSymbol('O');
        } else {
          setPlayerSymbol(null); // Spectator
        }
      });

      socket.on('error', (msg: string) => {
        setError(msg);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setConnected(false);
      });
    };

    socketInitializer();

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [gameId]);

  const handleCellClick = (index: number) => {
    if (!connected || !playerSymbol) return;
    if (gameState.winner || gameState.isDraw) return;
    if (gameState.currentPlayer !== playerSymbol) return;
    if (gameState.board[index] !== null) return;

    socket.emit('makeMove', { gameId, index, player: playerSymbol });
  };

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetGame = () => {
    if (!connected) return;
    socket.emit('resetGame', { gameId });
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tic Tac Toe Online</h1>
        <Link href="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </div>

      {error ? (
        <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
          <Link href="/" className="mt-2 inline-block text-primary hover:underline">
            Return to home
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 p-3 bg-gray-100 rounded-md flex justify-between items-center">
            <div>
              <span className="text-sm font-medium">Game ID: </span>
              <span className="font-mono">{gameId}</span>
            </div>
            <button
              onClick={copyGameId}
              className="text-sm px-4 py-1 rounded-md font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
            >
              {copied ? 'Copied!' : 'Copy ID'}
            </button>
          </div>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <PlayerInfo
              symbol="X"
              isConnected={Boolean(gameState.players.X)}
              isCurrentPlayer={gameState.currentPlayer === 'X'}
              isYou={playerSymbol === 'X'}
            />
            <PlayerInfo
              symbol="O"
              isConnected={Boolean(gameState.players.O)}
              isCurrentPlayer={gameState.currentPlayer === 'O'}
              isYou={playerSymbol === 'O'}
            />
          </div>

          <GameStatus
            winner={gameState.winner}
            isDraw={gameState.isDraw}
            isYourTurn={playerSymbol === gameState.currentPlayer}
            isPlayer={playerSymbol !== null}
          />

          <GameBoard
            board={gameState.board}
            onCellClick={handleCellClick}
            winnerSymbol={gameState.winner}
          />

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {playerSymbol ? (
                <span>You are Player <strong>{playerSymbol}</strong></span>
              ) : (
                <span>You are spectating ({gameState.spectators} watching)</span>
              )}
            </div>
            {(gameState.winner || gameState.isDraw) && (
              <button
                onClick={resetGame}
                className="px-4 py-2 rounded-md font-medium transition-colors bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                disabled={!connected}
              >
                Play Again
              </button>
            )}
          </div>

          {!connected && (
            <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
              Reconnecting to server...
            </div>
          )}
        </>
      )}
    </div>
  );
}