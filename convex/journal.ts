import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getEntryByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const entry = await ctx.db
      .query("journalEntries")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).eq("date", args.date)
      )
      .unique();

    return entry;
  },
});

export const getEntriesForMonth = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const startDate = `${args.year}-${String(args.month).padStart(2, '0')}-01`;
    const endDate = `${args.year}-${String(args.month).padStart(2, '0')}-31`;

    const entries = await ctx.db
      .query("journalEntries")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).gte("date", startDate).lte("date", endDate)
      )
      .collect();

    return entries;
  },
});

export const saveEntry = mutation({
  args: {
    date: v.string(),
    tasks: v.array(v.object({
      id: v.string(),
      text: v.string(),
      isLink: v.boolean(),
      url: v.optional(v.string()),
      isTodo: v.optional(v.boolean()),
      isCompleted: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const existingEntry = await ctx.db
      .query("journalEntries")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).eq("date", args.date)
      )
      .unique();

    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, {
        tasks: args.tasks,
      });
      return existingEntry._id;
    } else {
      return await ctx.db.insert("journalEntries", {
        userId,
        date: args.date,
        tasks: args.tasks,
      });
    }
  },
});
