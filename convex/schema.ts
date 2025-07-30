import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  journalEntries: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
    tasks: v.array(v.object({
      id: v.string(),
      text: v.string(),
      isLink: v.boolean(),
      url: v.optional(v.string()),
      isTodo: v.optional(v.boolean()),
      isCompleted: v.optional(v.boolean()),
    })),
  }).index("by_user_and_date", ["userId", "date"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
