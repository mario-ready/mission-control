import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  activities: defineTable({
    type: "string",
    description: "string",
    url: "string",
    timestamp: "number",
    agent: "string",
  }).index("by_timestamp", ["timestamp"]),
});