import { db } from "./db";
import {
  characters,
  categories,
  inventoryTemplates,
  type Character,
  type InsertCharacter,
  type Category,
  type InventoryTemplate,
} from "../shared/schema";
import { eq, asc } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  getCharacters(): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: string, updates: Partial<Character>): Promise<Character>;
  deleteCharacter(id: string): Promise<void>;

  getCategories(): Promise<Category[]>;
  createCategory(name: string): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  getTemplates(): Promise<InventoryTemplate[]>;
  createTemplate(template: any): Promise<InventoryTemplate>;
  deleteTemplate(id: string): Promise<void>;
  updateTemplate(id: string, updates: Partial<InventoryTemplate>): Promise<InventoryTemplate>;

  initializeDefaultCategories(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCharacters(): Promise<Character[]> {
    return await db.select().from(characters);
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const [character] = await db.insert(characters).values(insertCharacter).returning();
    return character;
  }

  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
    const [character] = await db.update(characters).set(updates).where(eq(characters.id, id)).returning();
    return character;
  }

  async deleteCharacter(id: string): Promise<void> {
    await db.delete(characters).where(eq(characters.id, id));
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.order));
  }

  async createCategory(name: string): Promise<Category> {
    const [category] = await db.insert(categories).values({ id: nanoid(), name, order: 0 }).returning();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getTemplates(): Promise<InventoryTemplate[]> {
    return await db.select().from(inventoryTemplates).orderBy(asc(inventoryTemplates.order));
  }

  async createTemplate(template: any): Promise<InventoryTemplate> {
    const [newTemplate] = await db.insert(inventoryTemplates).values({ ...template, id: nanoid() }).returning();
    return newTemplate;
  }

  async deleteTemplate(id: string): Promise<void> {
    await db.delete(inventoryTemplates).where(eq(inventoryTemplates.id, id));
  }

  async updateTemplate(id: string, updates: Partial<InventoryTemplate>): Promise<InventoryTemplate> {
    const [template] = await db.update(inventoryTemplates).set(updates).where(eq(inventoryTemplates.id, id)).returning();
    return template;
  }

  async initializeDefaultCategories(): Promise<void> {
    const existing = await this.getCategories();
    if (existing.length === 0) {
      await db.insert(categories).values([
        { id: "players", name: "Jogadores", order: 1 },
        { id: "allies", name: "Aliados", order: 2 },
        { id: "enemies", name: "Inimigos", order: 3 },
      ]);
    }

    const existingTemplates = await this.getTemplates();
    if (existingTemplates.length === 0) {
      await db.insert(inventoryTemplates).values([
        {
          id: nanoid(),
          categoryId: "enemies",
          name: "Bandido",
          type: "enemy",
          ac: 12,
          hp: 11,
          maxHp: 11,
          attacks: JSON.stringify([
            { name: "Cimitarra", type: "melee", toHit: "+3", damage: "1d6+1", damageType: "cortante" },
            { name: "Besta Leve", type: "ranged", toHit: "+3", damage: "1d8", damageType: "perfurante" }
          ]),
          image: "@assets/Bandido_1771782610726.jpeg",
          order: 1
        },
        {
          id: nanoid(),
          categoryId: "enemies",
          name: "Esqueleto",
          type: "enemy",
          ac: 13,
          hp: 13,
          maxHp: 13,
          attacks: JSON.stringify([
            { name: "Espada Curta", type: "melee", toHit: "+4", damage: "1d6+2", damageType: "perfurante" },
            { name: "Arco Curto", type: "ranged", toHit: "+4", damage: "1d6+2", damageType: "perfurante" }
          ]),
          image: "@assets/Esqueleto_1771782610731.jpeg",
          order: 2
        },
        {
          id: nanoid(),
          categoryId: "enemies",
          name: "Guarda",
          type: "enemy",
          ac: 16,
          hp: 11,
          maxHp: 11,
          attacks: JSON.stringify([
            { name: "Lança", type: "melee", toHit: "+3", damage: "1d6+1", damageType: "perfurante" }
          ]),
          image: "@assets/Guarda_1771782610733.jpeg",
          order: 3
        },
        {
          id: nanoid(),
          categoryId: "enemies",
          name: "Zumbi",
          type: "enemy",
          ac: 8,
          hp: 22,
          maxHp: 22,
          attacks: JSON.stringify([
            { name: "Pancada", type: "melee", toHit: "+3", damage: "1d6+1", damageType: "concussão" }
          ]),
          image: "@assets/Zumbi_1771782610733.jpeg",
          order: 4
        }
      ]);
    }
  }
}

export const storage = new DatabaseStorage();
await storage.initializeDefaultCategories();
