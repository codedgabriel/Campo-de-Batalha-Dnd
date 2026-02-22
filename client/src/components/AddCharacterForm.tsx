import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Skull, Shield, X } from "lucide-react";
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
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <RadioGroup 
              value={type} 
              onValueChange={(val) => setType(val as CharacterType)}
              className="grid grid-cols-3 gap-2"
            >
              <div>
                <RadioGroupItem value="player" id="player" className="peer sr-only" />
                <Label
                  htmlFor="player"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 cursor-pointer transition-all"
                >
                  <User className="mb-1 h-5 w-5 text-blue-500" />
                  <span className="text-xs font-semibold">Jogador</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="ally" id="ally" className="peer sr-only" />
                <Label
                  htmlFor="ally"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-500/10 cursor-pointer transition-all"
                >
                  <Shield className="mb-1 h-5 w-5 text-green-500" />
                  <span className="text-xs font-semibold">Aliado</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="enemy" id="enemy" className="peer sr-only" />
                <Label
                  htmlFor="enemy"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/10 cursor-pointer transition-all"
                >
                  <Skull className="mb-1 h-5 w-5 text-destructive" />
                  <span className="text-xs font-semibold">Inimigo</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

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

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 bg-background border border-input rounded-md"
              >
                <option value="">Nenhuma</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="init">Iniciativa Fixa (Manual)</Label>
              <Input
                id="init"
                type="number"
                value={initiative}
                onChange={(e) => setInitiative(e.target.value)}
                className="bg-background/50"
                autoComplete="off"
              />
            </div>

            {type !== "player" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ac">CA</Label>
                    <Input
                      id="ac"
                      type="number"
                      value={ac}
                      onChange={(e) => setAc(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hp">HP</Label>
                  <Input
                    id="hp"
                    type="number"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attacks">Ataques / Ações (Separe por vírgula)</Label>
                  <Input
                    id="attacks"
                    placeholder="Ex: Espada Curta +5, Mordida +3"
                    value={attacks}
                    onChange={(e) => setAttacks(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="count">Quantidade</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              </>
            )}
          </div>

          <Button type="submit" className="w-full font-bold">
            Adicionar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
