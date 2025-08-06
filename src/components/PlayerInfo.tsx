import React from 'react';
import { Player } from '@/types/game';

interface PlayerInfoProps {
  symbol: Player;
  isConnected: boolean;
  isCurrentPlayer: boolean;
  isYou: boolean;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ 
  symbol, 
  isConnected, 
  isCurrentPlayer,
  isYou
}) => {
  return (
    <div 
      className={`
        p-3 rounded-md border-2 flex items-center justify-between
        ${isCurrentPlayer ? 'border-primary bg-blue-50' : 'border-gray-200'}
        ${symbol === 'X' ? 'text-player-x' : 'text-player-o'}
      `}
    >
      <div className="flex items-center">
        <span className="text-2xl font-bold mr-2">{symbol}</span>
        <div>
          <div className="font-medium">
            Player {symbol} {isYou && '(You)'}
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            <span 
              className={`inline-block w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}
            ></span>
            {isConnected ? 'Connected' : 'Waiting for player...'}
          </div>
        </div>
      </div>
      {isCurrentPlayer && isConnected && (
        <div className="text-xs font-medium bg-primary text-white px-2 py-1 rounded">
          Current Turn
        </div>
      )}
    </div>
  );
};

export default PlayerInfo;