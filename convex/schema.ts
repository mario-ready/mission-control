import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  activities: defineTable({
    type: v.string(),
    description: v.string(),
    url: v.optional(v.string()),
    timestamp: v.number(),
    agent: v.string(),
  }).index("by_timestamp", ["timestamp"]),
});