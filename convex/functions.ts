import { mutation, query } from "./_generated/server";

export const addActivity = mutation({
  args: {
    type: "string",
    description: "string",
    url: "string",
    agent: "string",
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