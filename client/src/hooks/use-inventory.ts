import { useState, useEffect } from "react";
import { nanoid } from "nanoid";

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

export function useInventory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<InventoryTemplate[]>([]);

  useEffect(() => {
    const savedCats = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    const savedTemps = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (savedCats) {
      try {
        const parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed)) setCategories(parsed);
      } catch (e) { console.error(e); }
    }
    if (savedTemps) {
      try {
        const parsed = JSON.parse(savedTemps);
        if (Array.isArray(parsed)) setTemplates(parsed);
      } catch (e) { console.error(e); }
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
