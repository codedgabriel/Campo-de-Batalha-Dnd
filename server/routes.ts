import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // API Routes (Optional usage for this specific request, but good practice)
  app.get(api.characters.list.path, async (req, res) => {
    const characters = await storage.getCharacters();
    res.json(characters);
  });

  return httpServer;
}
