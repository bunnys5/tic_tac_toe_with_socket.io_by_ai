import React from 'react';
import { Player } from '@/types/game';

interface GameStatusProps {
  winner: Player | null;
  isDraw: boolean;
  isYourTurn: boolean;
  isPlayer: boolean;
}

const GameStatus: React.FC<GameStatusProps> = ({ 
  winner, 
  isDraw, 
  isYourTurn,
  isPlayer
}) => {
  let statusText = '';
  let statusClass = '';
  
  if (winner) {
    statusText = `Player ${winner} wins!`;
    statusClass = 'bg-green-100 text-green-800';
  } else if (isDraw) {
    statusText = 'Game ended in a draw!';
    statusClass = 'bg-yellow-100 text-yellow-800';
  } else if (isPlayer) {
    statusText = isYourTurn ? 'Your turn' : 'Waiting for opponent';
    statusClass = isYourTurn ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  } else {
    statusText = `Player ${isYourTurn ? 'X' : 'O'}'s turn`;
    statusClass = 'bg-gray-100 text-gray-800';
  }
  
  return (
    <div className={`p-3 rounded-md mb-6 text-center font-medium ${statusClass}`}>
      {statusText}
    </div>
  );
};

export default GameStatus;