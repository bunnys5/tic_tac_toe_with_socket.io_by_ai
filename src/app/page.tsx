'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const router = useRouter();
  const [gameId, setGameId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createNewGame = () => {
    const newGameId = uuidv4();
    router.push(`/game/${newGameId}`);
  };

  const joinGame = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!gameId.trim()) {
      setError('Please enter a game ID');
      return;
    }
    
    setLoading(true);
    router.push(`/game/${gameId}`);
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6">Tic Tac Toe Online</h1>
      
      <div className="space-y-6">
        <div>
          <button 
            onClick={createNewGame}
            className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
          >
            Create New Game
          </button>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Create a new game and share the game ID with a friend
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <form onSubmit={joinGame} className="space-y-4">
          <div>
            <label htmlFor="gameId" className="block text-sm font-medium text-gray-700">
              Join Existing Game
            </label>
            <input
              type="text"
              id="gameId"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter Game ID"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          <button 
            type="submit" 
            className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </form>
      </div>
    </div>
  );
}