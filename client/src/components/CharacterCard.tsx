import { Character } from "@/hooks/use-characters";
import { GripVertical, Sword, Skull, Shield, User, Trash2, Image as ImageIcon, FileText, Heart, PlusCircle, MinusCircle, Settings2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface CharacterCardProps {
  character: Character;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Character>) => void;
  onSelect: (id: string) => void;
  onAddCharacter: (name: string, type: "player" | "enemy" | "ally", initiative: number, count: number, image?: string, hp?: number, initiativeModifier?: number, ac?: number, attacks?: string) => void;
}

export function CharacterCard({ character, onRemove, onUpdate, onSelect, onAddCharacter }: CharacterCardProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [hpShortcuts, setHpShortcuts] = useState([-1, -5, -10, 1, 5]);
  const [editingShortcuts, setEditingShortcuts] = useState(false);
  const [tempShortcuts, setTempShortcuts] = useState(hpShortcuts.join(", "));
  
  const handleDuplicate = () => {
    onAddCharacter(
      `${character.name} (Cópia)`,
      character.type,
      character.initiative,
      1,
      character.image,
      character.hp,
      character.initiativeModifier,
      character.ac,
      character.attacks
    );
  };
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: character.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInitiativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      onUpdate(character.id, { initiative: val });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(character.id, { image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const adjustHp = (amount: number) => {
    const currentHp = character.hp ?? 0;
    onUpdate(character.id, { hp: currentHp + amount });
  };

  const hpPercentage = character.maxHp ? Math.max(0, Math.min(100, (character.hp || 0) / character.maxHp * 100)) : 100;

  const saveShortcuts = () => {
    const newShortcuts = tempShortcuts
      .split(",")
      .map(s => parseInt(s.trim()))
      .filter(s => !isNaN(s));
    if (newShortcuts.length > 0) {
      setHpShortcuts(newShortcuts);
    }
    setEditingShortcuts(false);
  };

  return (
    <>
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(character.id)}
      className={cn(
        "group relative flex items-center gap-2 md:gap-4 p-2.5 md:p-4 rounded-xl border transition-all duration-300 cursor-pointer",
        character.isTurn
          ? "bg-primary/10 border-primary shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)] scale-[1.01] md:scale-[1.02]"
          : "bg-card/50 border-border/50 hover:bg-card hover:border-border hover:shadow-lg hover:scale-[1.01] transition-transform",
        character.type === "enemy" 
          ? "border-l-4 border-l-destructive/60" 
          : character.type === "ally"
          ? "border-l-4 border-l-green-500/60"
          : "border-l-4 border-l-blue-500/60",
        isDragging && "opacity-50 scale-95 shadow-none"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-1"
      >
        <GripVertical className="w-4 h-4 md:w-5 md:h-5" />
      </div>

      {/* Avatar / Icon */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border shadow-inner",
          character.type === "enemy"
            ? "bg-destructive/10 border-destructive/30 text-destructive"
            : character.type === "ally"
            ? "bg-green-500/10 border-green-500/30 text-green-500"
            : "bg-blue-500/10 border-blue-500/30 text-blue-500",
          character.isTurn && "animate-pulse"
        )}
      >
        {character.type === "enemy" ? (
          <Skull className="w-5 h-5 md:w-6 md:h-6" />
        ) : character.type === "ally" ? (
          <Shield className="w-5 h-5 md:w-6 md:h-6" />
        ) : (
          <User className="w-5 h-5 md:w-6 md:h-6" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 md:gap-2">
          <h3 className="font-display font-bold text-sm md:text-lg truncate text-foreground tracking-wide">
            {character.name}
          </h3>
          {character.isTurn && (
            <Badge variant="default" className="bg-primary text-primary-foreground animate-in fade-in zoom-in duration-300 text-[8px] md:text-[10px] h-4 md:h-5 px-1 shrink-0">
              Turno
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] md:text-xs text-muted-foreground mt-0.5">
          <span className={cn(
            "uppercase font-bold tracking-wider",
            character.type === "enemy" ? "text-destructive" : character.type === "ally" ? "text-green-400" : "text-blue-400"
          )}>
            {character.type === "enemy" ? "Inimigo" : character.type === "ally" ? "Aliado" : "PJ"}
          </span>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-400" />
            <span className="font-bold text-foreground">CA {character.ac}</span>
          </div>
          {character.hp !== undefined && (
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span className="font-bold text-foreground">{character.hp} / {character.maxHp}</span>
            </div>
          )}
        </div>
        
        {character.attacks && (
          <div className="mt-1 flex items-center gap-1 text-[9px] md:text-[10px] text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded border border-border/30 w-fit">
            <Sword className="w-2.5 h-2.5" />
            <span className="truncate max-w-[150px]">{character.attacks}</span>
          </div>
        )}
        
        {character.hp !== undefined && (
          <div className="mt-2 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {hpShortcuts.map((val, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className={cn(
                  "h-6 px-1.5 text-[10px]",
                  val < 0 
                    ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/30" 
                    : "bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
                )}
                onClick={(e) => { e.stopPropagation(); adjustHp(val); }}
              >
                {val > 0 ? `+${val}` : val}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Initiative Score */}
      <div className="flex flex-col items-center gap-1">
        {character.type !== "player" && (
          <div className="flex flex-col items-center">
            <span className="text-[8px] md:text-[9px] uppercase font-bold text-muted-foreground tracking-widest">
              Bônus
            </span>
            <Input
              type="number"
              value={character.initiativeModifier}
              onChange={(e) => onUpdate(character.id, { initiativeModifier: parseInt(e.target.value) || 0 })}
              className="w-10 md:w-12 h-6 md:h-7 text-center text-xs font-bold bg-background/30 border-border p-0"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        <div className="flex flex-col items-center">
          <span className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
            Total
          </span>
          <div className="relative group/init">
            <Input
              type="number"
              value={character.initiative}
              onChange={handleInitiativeChange}
              className="w-12 md:w-16 h-8 md:h-10 text-center text-base md:text-lg font-bold bg-background/50 border-border focus:border-primary focus:ring-primary/20 p-0"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
          onClick={(e) => e.stopPropagation()}
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors md:opacity-0 group-hover:opacity-100 focus:opacity-100 w-8 h-8 md:w-10 md:h-10"
              title="Configurações"
            >
              <Settings2 className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border shadow-xl">
            <DropdownMenuLabel>Opções</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(); }}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicar Combatente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { 
                e.stopPropagation();
                const newName = window.prompt("Nome do Personagem:", character.name);
                if (newName) onUpdate(character.id, { name: newName });
              }}>
              <Settings2 className="w-4 h-4 mr-2" />
              Editar Nome
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Trocar Ficha (Imagem)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
                const newAttacks = window.prompt("Ataques/Ações:", character.attacks || "");
                if (newAttacks !== null) onUpdate(character.id, { attacks: newAttacks });
              }}>
              <Sword className="w-4 h-4 mr-2" />
              Editar Ataques
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
                const newAc = window.prompt("Classe de Armadura (CA):", character.ac.toString());
                if (newAc !== null) onUpdate(character.id, { ac: parseInt(newAc) || 10 });
              }}>
              <Shield className="w-4 h-4 mr-2" />
              Editar CA
            </DropdownMenuItem>
            {(character.type === 'enemy' || character.type === 'ally') && (
              <DropdownMenuItem onClick={() => {
                setTempShortcuts(hpShortcuts.join(", "));
                setEditingShortcuts(true);
                setIsConfigOpen(true);
              }}>
                <Heart className="w-4 h-4 mr-2" />
                Configurar Atalhos de Vida
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onRemove(character.id)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remover Combatente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active turn indicator bar */}
      {character.isTurn && (
        <motion.div
          layoutId="active-turn-indicator"
          className="absolute -left-[3px] md:-left-[4px] top-0 bottom-0 w-1 bg-primary rounded-l-md shadow-[0_0_10px_1px_hsl(var(--primary))]"
        />
      )}
    </div>

    <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle>Configurar Atalhos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Valores de HP (separados por vírgula)</Label>
            <Input 
              value={tempShortcuts} 
              onChange={(e) => setTempShortcuts(e.target.value)}
              placeholder="-1, -5, +5, +10"
              className="bg-background"
            />
            <p className="text-[10px] text-muted-foreground">Ex: -1, -5, -10, 1, 5, 10</p>
          </div>
          <Button onClick={() => { saveShortcuts(); setIsConfigOpen(false); }} className="w-full">
            Salvar Atalhos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
