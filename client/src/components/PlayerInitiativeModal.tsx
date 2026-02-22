import { useState, useEffect, useRef } from "react";
import { Character } from "@/hooks/use-characters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlayerInitiativeModalProps {
  players: Character[];
  onUpdate: (id: string, initiative: number) => void;
  onClose: () => void;
}

export function PlayerInitiativeModal({ players, onUpdate, onClose }: PlayerInitiativeModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPlayer = players[currentIndex];

  useEffect(() => {
    if (currentPlayer) {
      setValue(currentPlayer.initiative.toString());
      // Small timeout to ensure autofocus works after animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIndex, currentPlayer]);

  const handleNext = () => {
    const val = parseInt(value) || 0;
    onUpdate(currentPlayer.id, { initiative: val });
    
    if (currentIndex < players.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNext();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!currentPlayer) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Darkened backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-sm bg-card border-2 border-primary/30 rounded-3xl p-8 shadow-[0_0_50px_-12px_hsl(var(--primary)/0.5)]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-primary/60 font-bold">Definir Iniciativa</p>
            <h2 className="text-3xl font-display font-bold gold-text-shadow truncate px-4">
              {currentPlayer.name}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Label htmlFor="player-init" className="sr-only">Iniciativa</Label>
              <Input
                id="player-init"
                ref={inputRef}
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-center text-5xl h-24 font-bold bg-background/50 border-primary/20 focus:border-primary rounded-2xl"
                autoComplete="off"
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="rounded-full w-12 h-12 p-0 border-primary/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <Button
                size="lg"
                onClick={handleNext}
                className="flex-1 rounded-full h-12 bg-primary font-bold text-lg"
              >
                {currentIndex === players.length - 1 ? (
                  <>
                    Finalizar <Check className="ml-2 w-5 h-5" />
                  </>
                ) : (
                  <>
                    Próximo <ChevronRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Jogador {currentIndex + 1} de {players.length}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
