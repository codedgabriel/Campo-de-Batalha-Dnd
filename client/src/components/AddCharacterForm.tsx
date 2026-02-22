import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, User, Skull, Shield, X, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddCharacterFormProps {
  onAdd: (
    name: string, 
    type: "player" | "enemy" | "ally", 
    initiative: number, 
    count: number, 
    image?: string, 
    hp?: number,
    initiativeModifier?: number,
    ac?: number,
    attacks?: string
  ) => void;
  onSaveToInventory?: (
    name: string,
    type: string,
    hp?: number,
    ac?: number,
    initiativeModifier?: number,
    attacks?: string,
    image?: string
  ) => void;
}

const STORAGE_KEYS = {
  player: "dnd_initiative_recent_players",
  enemy: "dnd_initiative_recent_enemies",
  ally: "dnd_initiative_recent_allies",
};

type CharacterType = "player" | "enemy" | "ally";

export function AddCharacterForm({ onAdd, onSaveToInventory }: AddCharacterFormProps) {
  const [open, setOpen] = useState(false);
  const [saveToInv, setSaveToInv] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<CharacterType>("enemy");
  const [initiative, setInitiative] = useState("0");
  const [initModifier, setInitModifier] = useState("0");
  const [ac, setAc] = useState("10");
  const [attacks, setAttacks] = useState("");
  const [hp, setHp] = useState("");
  const [count, setCount] = useState("1");
  const [image, setImage] = useState<string | undefined>();
  const [recentNames, setRecentNames] = useState<Record<CharacterType, string[]>>({
    player: [],
    enemy: [],
    ally: [],
  });
  const [showRecent, setShowRecent] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const loaded: Record<CharacterType, string[]> = { player: [], enemy: [], ally: [] };
    (Object.keys(STORAGE_KEYS) as CharacterType[]).forEach(key => {
      const saved = localStorage.getItem(STORAGE_KEYS[key]);
      if (saved) {
        try {
          loaded[key] = JSON.parse(saved);
        } catch (e) {
          loaded[key] = [];
        }
      }
    });
    setRecentNames(loaded);
  }, []);

  const saveName = (newName: string, charType: CharacterType) => {
    if (!newName.trim()) return;
    const current = recentNames[charType];
    const updated = [newName, ...current.filter(n => n !== newName)].slice(0, 10);
    
    const newRecent = { ...recentNames, [charType]: updated };
    setRecentNames(newRecent);
    localStorage.setItem(STORAGE_KEYS[charType], JSON.stringify(updated));
  };

  const removeName = (nameToRemove: string, charType: CharacterType, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentNames[charType].filter(n => n !== nameToRemove);
    const newRecent = { ...recentNames, [charType]: updated };
    setRecentNames(newRecent);
    localStorage.setItem(STORAGE_KEYS[charType], JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    saveName(name.trim(), type);
    
    if (saveToInv && onSaveToInventory) {
      onSaveToInventory(
        name,
        type,
        hp ? parseInt(hp) : undefined,
        parseInt(ac) || 10,
        parseInt(initModifier) || 0,
        attacks,
        image
      );
    }

    onAdd(
      name, 
      type, 
      parseInt(initiative) || 0, 
      parseInt(count) || 1, 
      image, 
      hp ? parseInt(hp) : undefined,
      parseInt(initModifier) || 0,
      parseInt(ac) || 10,
      attacks
    );
    setName("");
    setInitiative("0");
    setInitModifier("0");
    setAc("10");
    setAttacks("");
    setHp("");
    setCount("1");
    setImage(undefined);
    setSaveToInv(false);
    setOpen(false);
    setShowRecent(false);
  };

  const currentRecent = recentNames[type];
  const typeLabels = {
    player: "Jogadores",
    enemy: "Inimigos",
    ally: "Aliados"
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) setShowRecent(false); }}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 rounded-full h-12"
        >
          <Plus className="w-5 h-5 mr-2" />
          Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border/50 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-primary">Invocação de Combatente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex: Rei Goblin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50"
                autoFocus
                autoComplete="off"
              />
            </div>

            {currentRecent.length > 0 && (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRecent(!showRecent)}
                  className="w-full flex items-center justify-between text-xs font-semibold py-1 h-8 border-dashed"
                >
                  <div className="flex items-center gap-2">
                    <History className="w-3 h-3" />
                    <span>{typeLabels[type]} recentes</span>
                  </div>
                  <span className={cn("transition-transform duration-200", showRecent ? "rotate-180" : "")}>
                    ▼
                  </span>
                </Button>
                
                {showRecent && (
                  <div className="grid grid-cols-1 gap-1 p-2 bg-muted/30 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-1">
                    {currentRecent.map((n) => (
                      <div
                        key={n}
                        className="flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md cursor-pointer group transition-colors"
                        onClick={() => { setName(n); setShowRecent(false); }}
                      >
                        <span className="text-sm truncate pr-4">{n}</span>
                        <button
                          type="button"
                          onClick={(e) => removeName(n, type, e)}
                          className="p-1 hover:bg-destructive/20 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <RadioGroup 
              value={type} 
              onValueChange={(val) => {
                setType(val as CharacterType);
                setShowRecent(false);
              }}
              className="grid grid-cols-3 gap-2"
            >
              <div>
                <RadioGroupItem value="player" id="player" className="peer sr-only" />
                <Label
                  htmlFor="player"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 [&:has([data-state=checked])]:border-blue-500 cursor-pointer transition-all"
                >
                  <User className="mb-1 h-5 w-5 text-blue-500" />
                  <span className="text-xs font-semibold">Jogador</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="ally" id="ally" className="peer sr-only" />
                <Label
                  htmlFor="ally"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-500/10 [&:has([data-state=checked])]:border-green-500 cursor-pointer transition-all"
                >
                  <Shield className="mb-1 h-5 w-5 text-green-500" />
                  <span className="text-xs font-semibold">Aliado</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="enemy" id="enemy" className="peer sr-only" />
                <Label
                  htmlFor="enemy"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/10 [&:has([data-state=checked])]:border-destructive cursor-pointer transition-all"
                >
                  <Skull className="mb-1 h-5 w-5 text-destructive" />
                  <span className="text-xs font-semibold">Inimigo</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="init">Bônus de Iniciativa</Label>
              <Input
                id="init"
                type="number"
                value={initModifier}
                onChange={(e) => setInitModifier(e.target.value)}
                className="bg-background/50"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ac">CA (Armadura)</Label>
              <Input
                id="ac"
                type="number"
                value={ac}
                onChange={(e) => setAc(e.target.value)}
                className="bg-background/50"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attacks">Ataques / Ações</Label>
            <Input
              id="attacks"
              placeholder="Ex: Espada Curta +5 (1d6+3)"
              value={attacks}
              onChange={(e) => setAttacks(e.target.value)}
              className="bg-background/50"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="init-manual">Iniciativa Atual (Opcional)</Label>
            <Input
              id="init-manual"
              type="number"
              value={initiative}
              onChange={(e) => setInitiative(e.target.value)}
              className="bg-background/50"
              autoComplete="off"
            />
          </div>

          {(type === "enemy" || type === "ally") && (
            <div className="space-y-2">
              <Label htmlFor="hp">Vida / HP (Opcional)</Label>
              <Input
                id="hp"
                type="number"
                placeholder="Ex: 50"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="bg-background/50"
                autoComplete="off"
              />
            </div>
          )}

          {(type === "enemy" || type === "ally") && (
            <div className="space-y-2">
              <Label htmlFor="count">Quantidade</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="bg-background/50"
                autoComplete="off"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="image">Ficha (Imagem)</Label>
            <div className="flex gap-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="bg-background/50 cursor-pointer flex-1"
              />
              {image && (
                <div className="relative w-10 h-10 border rounded overflow-hidden flex-shrink-0">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage(undefined)}
                    className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-0.5 rounded-bl"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 py-2">
            <input 
              type="checkbox" 
              id="saveInv" 
              checked={saveToInv} 
              onChange={(e) => setSaveToInv(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="saveInv" className="text-sm cursor-pointer">Salvar esta ficha no Inventário</Label>
          </div>

          <Button type="submit" className="w-full font-bold">
            Entrar na Batalha
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
