import { db } from "./db";
import {
  characters,
  type Character,
  type InsertCharacter
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Since the user requested "frontend only with localstorage", 
  // this backend storage is a fallback/placeholder or for future sync.
  getCharacters(): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
}

export class DatabaseStorage implements IStorage {
  async getCharacters(): Promise<Character[]> {
    return await db.select().from(characters);
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const [character] = await db.insert(characters)
      .values(insertCharacter)
      .returning();
    return character;
  }
}

export const storage = new DatabaseStorage();
