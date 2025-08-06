export type Player = 'X' | 'O';

export type Board = (Player | null)[];

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | null;
  isDraw: boolean;
  players: {
    X: string | null; // Socket ID of player X
    O: string | null; // Socket ID of player O
  };
  spectators: number;
}