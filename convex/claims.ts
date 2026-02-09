// convex/claims.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";

// Create a new claim token (for DIY setup flow)
export const createClaim = mutation({
  args: {
    payload: v.string(),  // Encrypted config JSON
    expiresInMs: v.optional(v.number()),  // Default 5 minutes
  },
  handler: async (ctx, args) => {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const createdAt = Date.now();
    const expiresAt = createdAt + (args.expiresInMs ?? 5 * 60 * 1000); // 5 min default

    await ctx.db.insert("claims", {
      token,
      payload: args.payload,
      createdAt,
      expiresAt,
    });

    return {
      token,
      url: `https://tawkie.dev/claim/${token}`,
      expiresAt,
    };
  },
});

// Redeem a claim token (one-time use)
export const redeemClaim = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .collect();

    if (claims.length === 0) {
      return { success: false, error: "Invalid or expired token" };
    }

    const claim = claims[0];

    // Check expiration
    if (Date.now() > claim.expiresAt) {
      await ctx.db.delete(claim._id);  // Clean up expired
      return { success: false, error: "Token expired" };
    }

    // Check if already used
    if (claim.usedAt) {
      return { success: false, error: "Token already used" };
    }

    // Mark as used
    await ctx.db.patch(claim._id, { usedAt: Date.now() });

    return {
      success: true,
      payload: claim.payload,
    };
  },
});

// Verify a claim token (without redeeming)
export const verifyClaim = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .collect();

    if (claims.length === 0) {
      return { valid: false, error: "Invalid token" };
    }

    const claim = claims[0];

    if (Date.now() > claim.expiresAt) {
      return { valid: false, error: "Token expired" };
    }

    if (claim.usedAt) {
      return { valid: false, error: "Token already used" };
    }

    return {
      valid: true,
      expiresAt: claim.expiresAt,
    };
  },
});

// Clean up expired claims (can be run periodically)
export const cleanupExpiredClaims = mutation({
  args: {},
  handler: async (ctx) => {
    const claims = await ctx.db.query("claims").collect();
    const now = Date.now();

    let deleted = 0;
    for (const claim of claims) {
      if (now > claim.expiresAt && !claim.usedAt) {
        await ctx.db.delete(claim._id);
        deleted++;
      }
    }

    return { deleted };
  },
});
