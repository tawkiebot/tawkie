// convex/memos.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";

// Generate a human-readable memo ID
function generateMemoId(): string {
  return `memo_${nanoid(10)}`;
}

// List all memos for a user
export const listMemos = query({
  args: { ownerId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const memos = await ctx.db
      .query("memos")
      .withIndex("by_owner", (q) => 
        args.ownerId ? q.eq("ownerId", args.ownerId) : q
      )
      .collect();
    
    // Sort by createdAt descending
    return memos.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
});

// Get a single memo by ID
export const getMemo = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const memos = await ctx.db
      .query("memos")
      .withIndex("by_created", (q) => q.eq("createdAt", args.id))
      .collect();
    
    return memos[0] || null;
  },
});

// Create a new memo
export const createMemo = mutation({
  args: {
    title: v.string(),
    transcript: v.string(),
    audioKey: v.string(),
    audioUrl: v.optional(v.string()),
    duration: v.number(),
    tags: v.optional(v.array(v.string())),
    ownerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const memoId = generateMemoId();
    const createdAt = new Date().toISOString();

    await ctx.db.insert("memos", {
      id: memoId,
      title: args.title,
      transcript: args.transcript,
      audioKey: args.audioKey,
      audioUrl: args.audioUrl,
      duration: args.duration,
      createdAt,
      tags: args.tags,
      ownerId: args.ownerId,
    });

    return { id: memoId, createdAt };
  },
});

// Delete a memo
export const deleteMemo = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const memos = await ctx.db
      .query("memos")
      .withIndex("by_created", (q) => q.eq("createdAt", args.id))
      .collect();

    if (memos.length > 0) {
      await ctx.db.delete(memos[0]._id);
      return true;
    }

    return false;
  },
});

// Update memo metadata (title, tags)
export const updateMemo = mutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const memos = await ctx.db
      .query("memos")
      .withIndex("by_created", (q) => q.eq("createdAt", args.id))
      .collect();

    if (memos.length === 0) {
      return null;
    }

    const memo = memos[0];
    await ctx.db.patch(memo._id, {
      title: args.title ?? memo.title,
      tags: args.tags ?? memo.tags,
    });

    return { ...memo, title: args.title ?? memo.title };
  },
});

// Get memos by date range
export const getMemosByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    ownerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const start = new Date(args.startDate).getTime();
    const end = new Date(args.endDate).getTime();

    const memos = await ctx.db
      .query("memos")
      .withIndex("by_owner", (q) => 
        args.ownerId ? q.eq("ownerId", args.ownerId) : q
      )
      .collect();

    return memos.filter((m) => {
      const created = new Date(m.createdAt).getTime();
      return created >= start && created <= end;
    });
  },
});
