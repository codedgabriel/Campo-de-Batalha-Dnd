import { useCharacters } from "@/hooks/use-characters";
import { CharacterCard } from "@/components/CharacterCard";
import { AddCharacterForm } from "@/components/AddCharacterForm";
import { InventoryManager } from "@/components/InventoryManager";
import { Button } from "@/components/ui/button";
import { Dices, ChevronRight, RotateCcw, Swords, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Tracker() {
  const {
    characters,
    addCharacter,
    removeCharacter,
    updateCharacter,
    rollInitiative,
    nextTurn,
    clearAll,
    clearEnemies,
    clearAllies,
    reorderCharacters,
  } = useCharacters();

  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId) || characters.find(c => c.isTurn);

  const handleRollInitiative = async () => {
    setIsRolling(true);
    // Simulate dice rolling time
    await new Promise(resolve => setTimeout(resolve, 1000));
    rollInitiative();
    setIsRolling(false);
  };

  useEffect(() => {
    const turnChar = characters.find(c => c.isTurn);
    if (turnChar) {
      setSelectedCharacterId(turnChar.id);
    }
  }, [characters.find(c => c.isTurn)?.id]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = characters.findIndex((c) => c.id === active.id);
      const newIndex = characters.findIndex((c) => c.id === over.id);
      reorderCharacters(arrayMove(characters, oldIndex, newIndex));
    }
  };

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container max-w-5xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Swords className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h1 className="text-lg md:text-2xl font-display font-bold gold-text-shadow truncate">
              Iniciativa
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearEnemies}
              className="flex hover:text-destructive hover:border-destructive/50 h-8 md:h-9"
            >
              <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">Limpar Inimigos</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllies}
              className="flex hover:text-green-500 hover:border-green-500/50 h-8 md:h-9"
            >
              <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">Limpar Aliados</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAll}
              className="flex hover:text-destructive hover:border-destructive/50 h-8 md:h-9"
            >
              <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">Limpar Tudo</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-4 md:py-6 overflow-hidden min-h-0">
        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
          {/* List Section (Left Half) - Scrollable */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1 md:mb-2 flex-shrink-0">
              <h2 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-widest">Combatentes</h2>
              <span className="text-[10px] md:text-xs text-muted-foreground">{characters.length} ativos</span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar min-h-0">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={characters.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-3 pb-24">
                    {characters.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[200px] md:h-[300px] border-2 border-dashed border-muted rounded-xl bg-card/20 text-center p-4 md:p-8">
                        <Swords className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground/50 mb-3 md:mb-4" />
                        <p className="text-base md:text-lg font-medium text-muted-foreground">O campo de batalha está calmo...</p>
                        <p className="text-xs md:text-sm text-muted-foreground/60">Adicione personagens para começar o encontro.</p>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {characters.map((char) => (
                          <motion.div
                            key={char.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          >
                            <CharacterCard
                              character={char}
                              onRemove={removeCharacter}
                              onUpdate={updateCharacter}
                              onSelect={setSelectedCharacterId}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>

          {/* Character Sheet Section (Right Half) - Fixed/Sticky */}
          <div className="flex-1 lg:max-w-xl h-full flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1 md:mb-2 flex-shrink-0">
              <h2 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Ficha do Personagem {selectedCharacter?.isTurn && "(Turno Atual)"}
              </h2>
            </div>
            <div className="flex-1 relative border-2 border-muted rounded-xl bg-card/20 overflow-hidden flex items-center justify-center mb-24 lg:mb-0">
              <AnimatePresence mode="wait">
                {selectedCharacter?.image ? (
                  <motion.div
                    key={selectedCharacter.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full h-full relative"
                  >
                    <img 
                      src={selectedCharacter.image} 
                      alt={`Ficha de ${selectedCharacter.name}`} 
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto border-2 border-dashed border-muted">
                      <Swords className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">Nenhuma ficha importada</p>
                      <p className="text-xs text-muted-foreground/60">Selecione um combatente ou adicione uma imagem para ver os detalhes aqui.</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button (Mobile) or Bottom Bar */}
      <div className="fixed bottom-4 md:bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none z-50">
        <div className="pointer-events-auto max-w-xl w-full flex gap-2 items-center justify-center">
          <div className="flex-1 max-w-[200px] shadow-2xl">
            <InventoryManager 
              onAddCharacter={addCharacter}
              onSelect={(template) => {
                addCharacter(
                  template.name,
                  template.type,
                  0,
                  1,
                  template.image,
                  template.hp,
                  template.initiativeModifier,
                  template.ac,
                  template.attacks
                );
              }}
            />
          </div>
          <div className="flex gap-2 bg-card/80 backdrop-blur-xl p-1.5 rounded-full border border-border/50 shadow-2xl">
            <Button
              size="icon"
              variant="secondary"
              onClick={handleRollInitiative}
              disabled={isRolling}
              className={cn(
                "rounded-full w-12 h-12 shadow-lg transition-all",
                isRolling ? "animate-bounce" : "hover:scale-105"
              )}
              title="Rolar Iniciativa"
            >
              <Dices className={cn("w-6 h-6", isRolling && "animate-spin")} />
            </Button>
            <Button
              size="icon"
              onClick={nextTurn}
              className="rounded-full w-12 h-12 shadow-lg hover:scale-105 transition-transform bg-primary"
              title="Próximo Turno"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
