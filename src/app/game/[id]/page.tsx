'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import GameBoard from '../../../components/GameBoard';
import PlayerInfo from '../../../components/PlayerInfo';
import GameStatus from '../../../components/GameStatus';
import { GameState, Player } from '../../../types/game';

// Generate a unique player ID
const generatePlayerId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export default function GamePage() {
  const params = useParams();
  
  if (!params?.id) {
    return <div>Invalid game ID</div>;
  }
  
  const gameId = params.id as string;
  const [playerId] = useState<string>(() => generatePlayerId());
  const [copied, setCopied] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  // Convex hooks
  const gameData = useQuery(api.games.getGame, { gameId });
  const joinGame = useMutation(api.games.joinGame);
  const makeMove = useMutation(api.games.makeMove);
  const resetGame = useMutation(api.games.resetGame);
  const updateActivity = useMutation(api.games.updatePlayerActivity);

  // Join the game when component mounts
  useEffect(() => {
    if (!hasJoined) {
      joinGame({ gameId, playerId }).then((result) => {
        setPlayerSymbol(result.playerSymbol);
        setHasJoined(true);
      }).catch(console.error);
    }
  }, [gameId, playerId, joinGame, hasJoined]);

  // Update activity periodically
  useEffect(() => {
    if (!hasJoined) return;
    
    const interval = setInterval(() => {
      updateActivity({ playerId }).catch(console.error);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [playerId, updateActivity, hasJoined]);

  const handleCellClick = async (index: number) => {
    if (!playerSymbol || !gameData?.gameState) return;
    if (gameData.gameState.winner || gameData.gameState.isDraw) return;
    if (gameData.gameState.currentPlayer !== playerSymbol) return;
    if (gameData.gameState.board[index] !== null) return;

    try {
      await makeMove({ gameId, playerId, index });
    } catch (err) {
      console.error('Error making move:', err);
    }
  };

  const handleResetGame = async () => {
    if (!playerSymbol) return;

    try {
      await resetGame({ gameId, playerId });
    } catch (err) {
      console.error('Error resetting game:', err);
    }
  };

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!gameData || !hasJoined) {
    return (
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading game...</span>
        </div>
      </div>
    );
  }

  const { gameState } = gameData;

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tic Tac Toe Online</h1>
        <Link href="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </div>

      <div className="mb-4 p-3 bg-gray-100 rounded-md flex justify-between items-center">
        <div>
          <span className="text-sm font-medium">Game ID: </span>
          <span className="font-mono">{gameId}</span>
        </div>
        <button 
          onClick={copyGameId} 
          className="text-sm px-4 py-1 rounded-md font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
          style={{
            padding: '4px 16px',
            borderRadius: '6px',
            fontWeight: '500',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
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
            onClick={handleResetGame} 
            className="px-4 py-2 rounded-md font-medium transition-colors bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '500',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}