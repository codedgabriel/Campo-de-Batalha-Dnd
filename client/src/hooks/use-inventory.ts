import { useState, useEffect } from "react";
import { nanoid } from "nanoid";

import bandidoImg from "@assets/Bandido_1771782610726.jpeg";
import esqueletoImg from "@assets/Esqueleto_1771782610731.jpeg";
import guardaImg from "@assets/Guarda_1771782610733.jpeg";
import zumbiImg from "@assets/Zumbi_1771782610733.jpeg";

export interface Category {
  id: string;
  name: string;
}

export interface InventoryTemplate {
  id: string;
  categoryId: string;
  name: string;
  type: "player" | "enemy" | "ally";
  ac: number;
  hp: number;
  maxHp: number;
  initiativeModifier: number;
  attacks: string;
  image?: string;
}

const STORAGE_KEY_CATEGORIES = "dnd_inventory_categories_v1";
const STORAGE_KEY_TEMPLATES = "dnd_inventory_templates_v1";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "players", name: "Jogadores" },
  { id: "allies", name: "Aliados" },
  { id: "enemies", name: "Inimigos" },
];

const DEFAULT_TEMPLATES: InventoryTemplate[] = [
  {
    id: "template-bandit",
    categoryId: "enemies",
    name: "Bandido",
    type: "enemy",
    ac: 12,
    hp: 11,
    maxHp: 11,
    initiativeModifier: 1,
    attacks: "Cimitarra +3, Besta Leve +3",
    image: bandidoImg
  },
  {
    id: "template-skeleton",
    categoryId: "enemies",
    name: "Esqueleto",
    type: "enemy",
    ac: 13,
    hp: 13,
    maxHp: 13,
    initiativeModifier: 2,
    attacks: "Espada Curta +4, Arco Curto +4",
    image: esqueletoImg
  },
  {
    id: "template-guard",
    categoryId: "enemies",
    name: "Guarda",
    type: "enemy",
    ac: 16,
    hp: 11,
    maxHp: 11,
    initiativeModifier: 1,
    attacks: "Lança +3",
    image: guardaImg
  },
  {
    id: "template-zombie",
    categoryId: "enemies",
    name: "Zumbi",
    type: "enemy",
    ac: 8,
    hp: 22,
    maxHp: 22,
    initiativeModifier: -2,
    attacks: "Pancada +3",
    image: zumbiImg
  }
];

export function useInventory() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [templates, setTemplates] = useState<InventoryTemplate[]>(DEFAULT_TEMPLATES);

  useEffect(() => {
    const savedCats = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    const savedTemps = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (savedCats) {
      try {
        const parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed);
      } catch (e) { console.error(e); }
    }
    if (savedTemps) {
      try {
        const parsed = JSON.parse(savedTemps);
        if (Array.isArray(parsed)) {
          // Merge saved templates with defaults
          // We use a Map to ensure uniqueness by name + type
          const templateMap = new Map();
          
          // Add defaults first
          DEFAULT_TEMPLATES.forEach(t => templateMap.set(`${t.name}-${t.type}`, t));
          
          // Add saved ones, potentially overwriting defaults if they were modified
          parsed.forEach(t => templateMap.set(`${t.name}-${t.type}`, t));
          
          setTemplates(Array.from(templateMap.values()));
        }
      } catch (e) { 
        console.error(e);
        setTemplates(DEFAULT_TEMPLATES);
      }
    } else {
      setTemplates(DEFAULT_TEMPLATES);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
  }, [templates]);

  const addCategory = (name: string) => {
    const newCat = { id: nanoid(), name };
    setCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setTemplates(prev => prev.filter(t => t.categoryId !== id));
  };

  const addTemplate = (template: Omit<InventoryTemplate, "id">) => {
    const newTemp = { ...template, id: nanoid() };
    setTemplates(prev => [...prev, newTemp]);
    return newTemp;
  };

  const removeTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const updateTemplate = (id: string, updates: Partial<InventoryTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  return {
    categories,
    templates,
    addCategory,
    removeCategory,
    addTemplate,
    removeTemplate,
    updateTemplate,
  };
}
