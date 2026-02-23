import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Skull, Shield, X, Image as ImageIcon, Heart, Sword } from "lucide-react";
import { AttackForm } from "./AttackForm";
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
                  <RadioGroupItem value="player" id="edit-player" className="peer sr-only" />
                  <Label
                    htmlFor="edit-player"
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover/50 p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 cursor-pointer transition-all h-20"
                  >
                    <User className="mb-1 h-6 w-6 text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Jogador</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="ally" id="edit-ally" className="peer sr-only" />
                  <Label
                    htmlFor="edit-ally"
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover/50 p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-500/10 cursor-pointer transition-all h-20"
                  >
                    <Shield className="mb-1 h-6 w-6 text-green-500" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Aliado</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="enemy" id="edit-enemy" className="peer sr-only" />
                  <Label
                    htmlFor="edit-enemy"
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
                <Label htmlFor="edit-name" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Nome do Combatente</Label>
                <Input
                  id="edit-name"
                  placeholder="Ex: Rei Goblin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/80 border-border/50 h-10"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Ficha / Avatar</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="edit-image"
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
              <Label htmlFor="edit-category" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Categoria</Label>
              <select
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-background/80 border border-border/50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                <option value="">Nenhuma</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 text-center">
              <Label htmlFor="edit-ac" className="text-xs uppercase tracking-widest font-bold text-blue-500/80">Defesa (CA)</Label>
              <div className="relative">
                <Input
                  id="edit-ac"
                  type="number"
                  value={ac}
                  onChange={(e) => setAc(e.target.value)}
                  className="bg-background/80 border-border/50 h-10 text-center font-bold text-blue-500"
                />
                <Shield className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-500/30" />
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-center">
                <Label htmlFor="edit-hp" className="text-xs uppercase tracking-widest font-bold text-red-500/80">Vida Máxima (HP)</Label>
                <div className="relative">
                  <Input
                    id="edit-hp"
                    type="number"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    className="bg-background/80 border-border/50 h-10 text-center font-bold text-red-500"
                  />
                  <Heart className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-red-500/30" />
                </div>
              </div>

              {type !== "player" && (
                <div className="space-y-2 text-center">
                  <Label htmlFor="edit-init-bonus" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Bônus Iniciativa</Label>
                  <Input
                    id="edit-init-bonus"
                    type="number"
                    value={initModifier}
                    onChange={(e) => setInitModifier(e.target.value)}
                    className="bg-background/80 border-border/50 h-10 text-center font-bold"
                  />
                </div>
              )}
            </div>

            <div className="pt-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2 block">Ações e Ataques do Grimório</Label>
              <div className="bg-background/50 rounded-lg border border-border/50 p-2">
                <AttackForm value={attacks} onChange={setAttacks} />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-display font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]">
            Salvar Alterações
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
