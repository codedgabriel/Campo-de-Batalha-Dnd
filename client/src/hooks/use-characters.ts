import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";

export interface Character {
  id: string;
  name: string;
  type: "player" | "enemy" | "ally";
  initiative: number;
  initiativeModifier: number;
  ac: number;
  attacks?: string;
  tieBreaker: number;
  isTurn: boolean;
  image?: string;
  hp?: number;
  maxHp?: number;
  dexterityModifier?: number;
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
        const parsed = JSON.parse(stored);
        // Migração simples para novos campos se não existirem
        const migrated = parsed.map((c: any) => ({
          ...c,
          initiativeModifier: c.initiativeModifier ?? 0,
          ac: c.ac ?? 10,
          attacks: c.attacks ?? "",
        }));
        setCharacters(migrated);
      } catch (e) {
        console.error("Failed to parse characters from localStorage");
      }
    }
  }, []);

  // Save to LocalStorage whenever characters change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  }, [characters]);

  const addCharacter = (
    name: string, 
    type: "player" | "enemy" | "ally", 
    initiative = 0, 
    count = 1, 
    image?: string, 
    hp?: number,
    initiativeModifier = 0,
    ac = 10,
    attacks = ""
  ) => {
    const newCharacters: Character[] = [];
    
    for (let i = 0; i < count; i++) {
      newCharacters.push({
        id: nanoid(),
        name: count > 1 ? `${name} ${i + 1}` : name,
        type,
        initiative,
        initiativeModifier,
        ac,
        attacks,
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
        const d20 = Math.floor(Math.random() * 20) + 1;
        const totalInitiative = d20 + (char.initiativeModifier || 0);
        const tieBreaker = Math.floor(Math.random() * 20) + 1;

        if (char.type === "enemy" || char.type === "ally") {
          return {
            ...char,
            initiative: totalInitiative,
            tieBreaker,
            isTurn: false,
          };
        }
        // Players keep their manually entered initiative if they want, 
        // but here we roll for everyone to satisfy "sum with d20" requirement
        return { 
          ...char, 
          initiative: totalInitiative,
          isTurn: false, 
          tieBreaker 
        };
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
