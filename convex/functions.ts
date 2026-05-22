import { mutation, query } from "./_generated/server";
import { v } from "convex/server";

export const addActivity = mutation({
  args: {
    type: v.string(),
    description: v.string(),
    url: v.optional(v.string()),
    agent: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activities", {
      type: args.type,
      description: args.description,
      url: args.url,
      agent: args.agent,
      timestamp: Date.now(),
    });
  },
});

export const listActivities = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("activities").orderBy("timestamp", "desc").take(50);
  },
});