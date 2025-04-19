import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  premium: boolean("premium").default(false).notNull(),
  dailyGenerations: integer("daily_generations").default(0).notNull(),
  lastGeneratedAt: timestamp("last_generated_at"),
});

export const aiTools = pgTable("ai_tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  toolId: integer("tool_id").notNull(),
  prompt: text("prompt").notNull(),
  output: text("output").notNull(),
  title: text("title").notNull(),
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertToolSchema = createInsertSchema(aiTools).pick({
  name: true,
  description: true,
  icon: true,
  color: true,
});

export const insertGenerationSchema = createInsertSchema(generations).pick({
  userId: true,
  toolId: true,
  prompt: true,
  output: true,
  title: true,
  tags: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = typeof aiTools.$inferSelect;

export type InsertGeneration = z.infer<typeof insertGenerationSchema>;
export type Generation = typeof generations.$inferSelect;
