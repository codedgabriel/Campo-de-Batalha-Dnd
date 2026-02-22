import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We'll use this schema for type definitions even if we strictly use localStorage on the frontend
export const characters = pgTable("characters", {
  id: text("id").primaryKey(), // Using UUID v4 for frontend generation
  name: text("name").notNull(),
  type: text("type").notNull(), // 'player' | 'enemy' | 'ally'
  initiative: integer("initiative").default(0),
  initiativeModifier: integer("initiative_modifier").default(0),
  ac: integer("ac").default(10),
  attacks: text("attacks"), // Store as a simple string for now
  isTurn: boolean("is_turn").default(false),
  image: text("image"), // Base64 or URL of the character sheet image
  hp: integer("hp"),
  maxHp: integer("max_hp"),
  // For tie-breaking (hidden value)
  tieBreaker: integer("tie_breaker").default(0),
});

export const insertCharacterSchema = createInsertSchema(characters);

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
