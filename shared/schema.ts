import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the structure for an attack/action
export const attackSchema = z.object({
  name: z.string(),
  type: z.enum(["melee", "ranged", "spell", "other"]),
  toHit: z.string().optional(), // e.g., "+5"
  damage: z.string().optional(), // e.g., "1d8+3"
  damageType: z.string().optional(), // e.g., "slashing"
  description: z.string().optional(),
});

export type Attack = z.infer<typeof attackSchema>;

// We'll use this schema for type definitions even if we strictly use localStorage on the frontend
export const characters = pgTable("characters", {
  id: text("id").primaryKey(), // Using UUID v4 for frontend generation
  name: text("name").notNull(),
  type: text("type").notNull(), // 'player' | 'enemy' | 'ally'
  initiative: integer("initiative").default(0),
  initiativeModifier: integer("initiative_modifier").default(0),
  ac: integer("ac").default(10),
  attacks: text("attacks"), // Store as a JSON string for now to avoid complex migrations, but structure it
  category: text("category"), // Added category field
  quantity: integer("quantity").default(1), // Added quantity field
  isTurn: boolean("is_turn").default(false),
  image: text("image"), // Base64 or URL of the character sheet image
  hp: integer("hp"),
  maxHp: integer("max_hp"),
  // For tie-breaking (hidden value)
  tieBreaker: integer("tie_breaker").default(0),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  order: integer("order").default(0),
});

export const inventoryTemplates = pgTable("inventory_templates", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").references(() => categories.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'player' | 'enemy' | 'ally'
  ac: integer("ac").default(10),
  hp: integer("hp"),
  maxHp: integer("max_hp"),
  initiativeModifier: integer("initiative_modifier").default(0),
  attacks: text("attacks"),
  image: text("image"),
  order: integer("order").default(0),
});

export const insertCharacterSchema = createInsertSchema(characters);
export const insertCategorySchema = createInsertSchema(categories);
export const insertInventoryTemplateSchema = createInsertSchema(inventoryTemplates);

export type Character = typeof characters.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InventoryTemplate = typeof inventoryTemplates.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
