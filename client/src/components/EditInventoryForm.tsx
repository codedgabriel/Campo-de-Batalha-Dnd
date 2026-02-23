import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Skull, Shield, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useInventory, type InventoryTemplate } from "@/hooks/use-inventory";

interface EditInventoryFormProps {
  template: InventoryTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<InventoryTemplate>) => void;
}

type CharacterType = "player" | "enemy" | "ally";

export function EditInventoryForm({ template, open, onOpenChange, onSave }: EditInventoryFormProps) {
  const [name, setName] = useState(template.name);
  const [type, setType] = useState<CharacterType>(template.type);
  const [initModifier, setInitModifier] = useState(template.initiativeModifier.toString());
  const [ac, setAc] = useState(template.ac.toString());
  const [attacks, setAttacks] = useState(template.attacks || "");
  const [hp, setHp] = useState(template.hp.toString());
  const [category, setCategory] = useState(template.categoryId);
  const [image, setImage] = useState<string | undefined>(template.image);

  const { categories } = useInventory();

  // Update local state when template changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(template.name);
      setType(template.type);
      setInitModifier(template.initiativeModifier.toString());
      setAc(template.ac.toString());
      setAttacks(template.attacks || "");
      setHp(template.hp.toString());
      setCategory(template.categoryId);
      setImage(template.image);
    }
  }, [open, template]);

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
    
    onSave(template.id, {
      name,
      type,
      hp: parseInt(hp) || 0,
      maxHp: parseInt(hp) || 0,
      ac: parseInt(ac) || 10,
      initiativeModifier: parseInt(initModifier) || 0,
      attacks,
      image,
      categoryId: category
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/50 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-primary">Editar Item do Inventário</DialogTitle>
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
                <RadioGroupItem value="player" id="edit-player" className="peer sr-only" />
                <Label
                  htmlFor="edit-player"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 cursor-pointer transition-all"
                >
                  <User className="mb-1 h-5 w-5 text-blue-500" />
                  <span className="text-xs font-semibold">Jogador</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="ally" id="edit-ally" className="peer sr-only" />
                <Label
                  htmlFor="edit-ally"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-500/10 cursor-pointer transition-all"
                >
                  <Shield className="mb-1 h-5 w-5 text-green-500" />
                  <span className="text-xs font-semibold">Aliado</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="enemy" id="edit-enemy" className="peer sr-only" />
                <Label
                  htmlFor="edit-enemy"
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
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                placeholder="Ex: Rei Goblin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image">Ficha (Imagem)</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-image"
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
              <Label htmlFor="edit-category">Categoria</Label>
              <select
                id="edit-category"
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

            <div className="grid grid-cols-2 gap-4">
              {type !== "player" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-init-bonus">Bônus de Iniciativa</Label>
                  <Input
                    id="edit-init-bonus"
                    type="number"
                    value={initModifier}
                    onChange={(e) => setInitModifier(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-ac">CA</Label>
                <Input
                  id="edit-ac"
                  type="number"
                  value={ac}
                  onChange={(e) => setAc(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-hp">HP</Label>
              <Input
                id="edit-hp"
                type="number"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-attacks">Ataques / Ações (JSON ou Texto)</Label>
              <Textarea
                id="edit-attacks"
                placeholder='Ex: [{"name": "Espada", "toHit": "+5", "damage": "1d8+3"}]'
                value={attacks}
                onChange={(e) => setAttacks(e.target.value)}
                className="bg-background/50 font-mono text-xs h-20"
              />
            </div>
          </div>

          <Button type="submit" className="w-full font-bold">
            Salvar Alterações
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
