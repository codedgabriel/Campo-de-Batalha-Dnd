import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Skull, Shield, X, Image as ImageIcon, Heart, Sword, Dice5 } from "lucide-react";
import { AttackForm } from "./AttackForm";
import { useInventory } from "@/hooks/use-inventory";

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

type CharacterType = "player" | "enemy" | "ally";

export function AddCharacterForm({ onAdd, onSaveToInventory }: AddCharacterFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<CharacterType>("enemy");
  const [initiative, setInitiative] = useState("0");
  const [initModifier, setInitModifier] = useState("0");
  const [ac, setAc] = useState("10");
  const [attacks, setAttacks] = useState("");
  const [hp, setHp] = useState("");
  const [count, setCount] = useState("1");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<string | undefined>();

  const { categories } = useInventory();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAdd(
      name, 
      type, 
      parseInt(initiative) || 0, 
      parseInt(count) || 1, 
      image, 
      hp ? parseInt(hp) : undefined,
      parseInt(initModifier) || 0,
      parseInt(ac) || 10,
      attacks || ""
    );

    if (onSaveToInventory) {
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

    setName("");
    setInitiative("0");
    setInitModifier("0");
    setAc("10");
    setAttacks("");
    setHp("");
    setCount("1");
    setImage(undefined);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-bold shadow-lg rounded-full h-12"
        >
          Criar Ficha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border/50 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-primary">Criação de Personagem</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Alinhamento / Tipo</Label>
              <RadioGroup 
                value={type} 
                onValueChange={(val) => setType(val as CharacterType)}
                className="grid grid-cols-3 gap-3"
              >
                <div>
                  <RadioGroupItem value="player" id="player" className="peer sr-only" />
                  <Label
                    htmlFor="player"
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover/50 p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 cursor-pointer transition-all h-20"
                  >
                    <User className="mb-1 h-6 w-6 text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Jogador</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="ally" id="ally" className="peer sr-only" />
                  <Label
                    htmlFor="ally"
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover/50 p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-500/10 cursor-pointer transition-all h-20"
                  >
                    <Shield className="mb-1 h-6 w-6 text-green-500" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Aliado</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="enemy" id="enemy" className="peer sr-only" />
                  <Label
                    htmlFor="enemy"
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover/50 p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/10 cursor-pointer transition-all h-20"
                  >
                    <Skull className="mb-1 h-6 w-6 text-destructive" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Inimigo</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Nome do Combatente</Label>
                <Input
                  id="name"
                  placeholder="Ex: Rei Goblin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/80 border-border/50 h-10"
                  autoFocus
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Ficha / Avatar</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="bg-background/80 border-border/50 h-10 cursor-pointer pr-10"
                    />
                    <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {image && (
                    <div className="relative w-10 h-10 border rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImage(undefined)}
                        className="absolute top-0 right-0 bg-destructive text-white p-0.5 rounded-bl hover:bg-destructive/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Categoria (Opcional)</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-background/80 border border-border/50 rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
              >
                <option value="">Nenhuma</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="init" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Iniciativa Fixa</Label>
              <Input
                id="init"
                type="number"
                value={initiative}
                onChange={(e) => setInitiative(e.target.value)}
                className="bg-background/80 border-border/50 h-10 text-center font-bold"
                autoComplete="off"
              />
            </div>
          </div>

          {type !== "player" && (
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 text-center">
                  <Label htmlFor="hp" className="text-xs uppercase tracking-widest font-bold text-red-500/80">Vida (HP)</Label>
                  <div className="relative">
                    <Input
                      id="hp"
                      type="number"
                      value={hp}
                      onChange={(e) => setHp(e.target.value)}
                      className="bg-background/80 border-border/50 h-10 text-center font-bold text-red-500"
                    />
                    <Heart className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-red-500/30" />
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <Label htmlFor="ac" className="text-xs uppercase tracking-widest font-bold text-blue-500/80">Defesa (CA)</Label>
                  <div className="relative">
                    <Input
                      id="ac"
                      type="number"
                      value={ac}
                      onChange={(e) => setAc(e.target.value)}
                      className="bg-background/80 border-border/50 h-10 text-center font-bold text-blue-500"
                    />
                    <Shield className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-500/30" />
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <Label htmlFor="count" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Qtd.</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="bg-background/80 border-border/50 h-10 text-center font-bold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2 block">Ações e Ataques</Label>
                <div className="bg-background/50 rounded-lg border border-border/50 p-2">
                  <AttackForm value={attacks} onChange={setAttacks} />
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full h-12 text-lg font-display font-bold shadow-[0_4px_14px_0_rgba(var(--primary),0.39)] transition-all hover:scale-[1.02] active:scale-[0.98]">
            Adicionar ao Combate
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
