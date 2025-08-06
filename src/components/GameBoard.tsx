import React from 'react';
import { Board, Player } from '../types/game';

interface GameBoardProps {
  board: Board;
  onCellClick: (index: number) => void;
  winnerSymbol: Player | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onCellClick, winnerSymbol }) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto aspect-square">
      {board.map((cell, index) => {
        const isWinningCell = winnerSymbol && cell === winnerSymbol;
        
        return (
          <div 
            key={index}
            className={`
              game-cell
              ${cell === 'X' ? 'game-cell-x' : ''}
              ${cell === 'O' ? 'game-cell-o' : ''}
              ${isWinningCell ? 'bg-yellow-100 animate-pulse-slow' : ''}
            `}
            onClick={() => onCellClick(index)}
          >
            {cell}
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;