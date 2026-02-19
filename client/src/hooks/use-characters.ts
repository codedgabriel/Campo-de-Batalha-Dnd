import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";

export interface Character {
  id: string;
  name: string;
  type: "player" | "enemy" | "ally";
  initiative: number;
  tieBreaker: number;
  isTurn: boolean;
  image?: string;
  hp?: number;
  maxHp?: number;
  dexterityModifier?: number; // Optional: could be used for auto-rolling tie breakers later
}

const STORAGE_KEY = "dnd_initiative_tracker_v1";

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const { toast } = useToast();

  // Load from LocalStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCharacters(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse characters from localStorage");
      }
    }
  }, []);

  // Save to LocalStorage whenever characters change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  }, [characters]);

  const addCharacter = (name: string, type: "player" | "enemy" | "ally", initiative = 0, count = 1, image?: string, hp?: number) => {
    const newCharacters: Character[] = [];
    
    for (let i = 0; i < count; i++) {
      newCharacters.push({
        id: nanoid(),
        name: count > 1 ? `${name} ${i + 1}` : name,
        type,
        initiative,
        tieBreaker: 0,
        isTurn: false,
        image,
        hp,
        maxHp: hp,
      });
    }
    
    setCharacters((prev) => [...prev, ...newCharacters]);
  };

  const removeCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const clearAll = () => {
    if (window.confirm("Tem certeza que deseja limpar todo o encontro?")) {
      setCharacters([]);
    }
  };

  const clearEnemies = () => {
    if (window.confirm("Tem certeza que deseja remover todos os inimigos?")) {
      setCharacters((prev) => prev.filter((c) => c.type !== "enemy"));
    }
  };

  const clearAllies = () => {
    if (window.confirm("Tem certeza que deseja remover todos os aliados?")) {
      setCharacters((prev) => prev.filter((c) => c.type !== "ally"));
    }
  };

  // Logic for Rolling Initiative
  const rollInitiative = () => {
    setCharacters((prev) => {
      const rolled = prev.map((char) => {
        if (char.type === "enemy" || char.type === "ally") {
          const d20 = Math.floor(Math.random() * 20) + 1;
          const tieBreaker = Math.floor(Math.random() * 20) + 1;
          return {
            ...char,
            initiative: d20,
            tieBreaker,
            isTurn: false,
          };
        }
        // Players keep their manually entered initiative
        return { ...char, isTurn: false, tieBreaker: Math.floor(Math.random() * 20) + 1 };
      });

      // Sort: Highest Initiative first. If tie, compare tieBreaker.
      return [...rolled].sort((a, b) => {
        if (b.initiative !== a.initiative) return b.initiative - a.initiative;
        return b.tieBreaker - a.tieBreaker;
      });
    });
  };

  const nextTurn = () => {
    if (characters.length === 0) return;

    setCharacters((prev) => {
      const currentIdx = prev.findIndex((c) => c.isTurn);
      const nextIdx = (currentIdx + 1) % prev.length;

      return prev.map((char, idx) => ({
        ...char,
        isTurn: idx === nextIdx,
      }));
    });
  };

  const reorderCharacters = (newOrder: Character[]) => {
    setCharacters(newOrder);
  };

  return {
    characters,
    addCharacter,
    removeCharacter,
    updateCharacter,
    clearAll,
    clearEnemies,
    clearAllies,
    rollInitiative,
    nextTurn,
    reorderCharacters,
  };
}
