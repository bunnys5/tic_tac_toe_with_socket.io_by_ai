import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get game state (read-only)
export const getGame = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const { gameId } = args;
    
    const game = await ctx.db
      .query("games")
      .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
      .first();

    if (!game) {
      return null;
    }

    return {
      gameState: {
        board: game.board,
        currentPlayer: game.currentPlayer,
        winner: game.winner,
        isDraw: game.isDraw,
        players: { X: game.playerX, O: game.playerO },
        spectators: game.spectators,
      },
    };
  },
});

// Join a game (creates game if doesn't exist, assigns player)
export const joinGame = mutation({
  args: { gameId: v.string(), playerId: v.string() },
  handler: async (ctx, args) => {
    const { gameId, playerId } = args;
    
    // Get or create game
    let game = await ctx.db
      .query("games")
      .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
      .first();

    if (!game) {
      // Create new game
      await ctx.db.insert("games", {
        gameId,
        board: Array(9).fill(null),
        currentPlayer: "X",
        winner: null,
        isDraw: false,
        playerX: null,
        playerO: null,
        spectators: 0,
        lastActivity: Date.now(),
      });

      
      
      game = await ctx.db
        .query("games")
        .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
        .first();
    }

    if (!game) throw new Error("Failed to create game");

    // Check if player already exists
    let player = await ctx.db
      .query("players")
      .withIndex("by_playerId", (q) => q.eq("playerId", playerId))
      .first();

    if (!player) {
      // Assign player to X or O
      let symbol: "X" | "O" | null = null;
      if (!game.playerX) {
        symbol = "X";
        await ctx.db.patch(game._id, { playerX: playerId });
      } else if (!game.playerO) {
        symbol = "O";
        await ctx.db.patch(game._id, { playerO: playerId });
      } else {
        // Spectator
        await ctx.db.patch(game._id, { spectators: game.spectators + 1 });
      }

      await ctx.db.insert("players", {
        playerId,
        gameId,
        symbol,
        lastSeen: Date.now(),
      });

      player = await ctx.db
        .query("players")
        .withIndex("by_playerId", (q) => q.eq("playerId", playerId))
        .first();
    } else {
      // Update last seen
      await ctx.db.patch(player._id, { lastSeen: Date.now() });
    }

    if (!player) throw new Error("Failed to create player");

    // Clean up disconnected players (haven't been seen for 30 seconds)
    const now = Date.now();
    const disconnectedPlayers = await ctx.db
      .query("players")
      .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
      .filter((q) => q.lt(q.field("lastSeen"), now - 30000))
      .collect();

    for (const disconnectedPlayer of disconnectedPlayers) {
      if (game.playerX === disconnectedPlayer.playerId) {
        await ctx.db.patch(game._id, { playerX: null });
      } else if (game.playerO === disconnectedPlayer.playerId) {
        await ctx.db.patch(game._id, { playerO: null });
      } else {
        await ctx.db.patch(game._id, { spectators: Math.max(0, game.spectators - 1) });
      }
      await ctx.db.delete(disconnectedPlayer._id);
    }

    // Get updated game state
    const updatedGame = await ctx.db.get(game._id);
    if (!updatedGame) throw new Error("Game not found");

    return {
      gameState: {
        board: updatedGame.board,
        currentPlayer: updatedGame.currentPlayer,
        winner: updatedGame.winner,
        isDraw: updatedGame.isDraw,
        players: { X: updatedGame.playerX, O: updatedGame.playerO },
        spectators: updatedGame.spectators,
      },
      playerSymbol: player.symbol,
    };
  },
});

// Update player's last seen time
export const updatePlayerActivity = mutation({
  args: { playerId: v.string() },
  handler: async (ctx, args) => {
    const { playerId } = args;
    
    const player = await ctx.db
      .query("players")
      .withIndex("by_playerId", (q) => q.eq("playerId", playerId))
      .first();

    if (player) {
      await ctx.db.patch(player._id, { lastSeen: Date.now() });
    }
  },
});

// Make a move
export const makeMove = mutation({
  args: {
    gameId: v.string(),
    playerId: v.string(),
    index: v.number(),
  },
  handler: async (ctx, args) => {
    const { gameId, playerId, index } = args;

    const game = await ctx.db
      .query("games")
      .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
      .first();

    if (!game) throw new Error("Game not found");

    const player = await ctx.db
      .query("players")
      .withIndex("by_playerId", (q) => q.eq("playerId", playerId))
      .first();

    if (!player || !player.symbol) throw new Error("Player not found or not assigned");

    // Validate move
    if (
      game.winner ||
      game.isDraw ||
      game.currentPlayer !== player.symbol ||
      game.board[index] !== null
    ) {
      throw new Error("Invalid move");
    }

    // Update board
    const newBoard = [...game.board];
    newBoard[index] = player.symbol;

    // Check for winner
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    let winner: "X" | "O" | null = null;
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        newBoard[a] &&
        newBoard[a] === newBoard[b] &&
        newBoard[a] === newBoard[c]
      ) {
        winner = player.symbol;
        break;
      }
    }

    // Check for draw
    const isDraw = !winner && !newBoard.includes(null);

    // Switch current player if game is still ongoing
    const currentPlayer = !winner && !isDraw ? (player.symbol === "X" ? "O" : "X") : game.currentPlayer;

    await ctx.db.patch(game._id, {
      board: newBoard,
      currentPlayer,
      winner,
      isDraw,
      lastActivity: Date.now(),
    });

    return { success: true };
  },
});

// Reset game
export const resetGame = mutation({
  args: {
    gameId: v.string(),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const { gameId, playerId } = args;

    const game = await ctx.db
      .query("games")
      .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
      .first();

    if (!game) throw new Error("Game not found");

    const player = await ctx.db
      .query("players")
      .withIndex("by_playerId", (q) => q.eq("playerId", playerId))
      .first();

    if (!player || !player.symbol) {
      throw new Error("Only players can reset the game");
    }

    await ctx.db.patch(game._id, {
      board: Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
      isDraw: false,
      lastActivity: Date.now(),
    });

    return { success: true };
  },
});