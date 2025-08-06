import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    gameId: v.string(),
    board: v.array(v.union(v.literal("X"), v.literal("O"), v.null())),
    currentPlayer: v.union(v.literal("X"), v.literal("O")),
    winner: v.union(v.literal("X"), v.literal("O"), v.null()),
    isDraw: v.boolean(),
    playerX: v.union(v.string(), v.null()),
    playerO: v.union(v.string(), v.null()),
    spectators: v.number(),
    lastActivity: v.number(),
  }).index("by_gameId", ["gameId"]),
  
  players: defineTable({
    playerId: v.string(),
    gameId: v.string(),
    symbol: v.union(v.literal("X"), v.literal("O"), v.null()),
    lastSeen: v.number(),
  }).index("by_playerId", ["playerId"])
    .index("by_gameId", ["gameId"]),
});