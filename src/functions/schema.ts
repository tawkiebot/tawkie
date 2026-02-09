// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Memo storage - voice memos with audio
  memos: defineTable({
    id: v.string(),           // Human-readable ID (memo_abc123)
    title: v.string(),
    transcript: v.string(),
    audioKey: v.string(),      // R2/S3 object key (user's bucket)
    audioUrl: v.optional(v.string()),  // Public URL
    duration: v.number(),     // Seconds
    createdAt: v.string(),    // ISO 8601
    tags: v.optional(v.array(v.string())),
    ownerId: v.optional(v.string()),  // For multi-user (future)
  })
    .index("by_created", ["createdAt"])
    .index("by_owner", ["ownerId"]),

  // Claims (one-time config imports for DIY setup)
  claims: defineTable({
    token: v.string(),
    payload: v.string(),      // Encrypted config JSON
    createdAt: v.number(),    // Unix timestamp
    expiresAt: v.number(),    // Unix timestamp (5 min)
    usedAt: v.optional(v.number()),
  })
    .index("by_token", ["token"]),

  // User connections (optional - for future multi-user support)
  connections: defineTable({
    userId: v.string(),
    name: v.string(),
    storageProvider: v.string(),      // "r2", "s3", "b2"
    storageBucket: v.string(),
    storageEndpoint: v.optional(v.string()),
    databaseUrl: v.optional(v.string()),
    notifyProvider: v.string(),       // "telegram", "discord", "webhook"
    notifyConfig: v.string(),        // Encrypted config
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),
});

// Type exports for use in functions
export type Memo = {
  id: string;
  title: string;
  transcript: string;
  audioKey: string;
  audioUrl?: string;
  duration: number;
  createdAt: string;
  tags?: string[];
  ownerId?: string;
};

export type Claim = {
  token: string;
  payload: string;
  createdAt: number;
  expiresAt: number;
  usedAt?: number;
};

export type Connection = {
  userId: string;
  name: string;
  storageProvider: string;
  storageBucket: string;
  storageEndpoint?: string;
  databaseUrl?: string;
  notifyProvider: string;
  notifyConfig: string;
  createdAt: number;
};
