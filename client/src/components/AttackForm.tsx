import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Swords } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface Attack {
  name: string;
  toHit: string;
  damage: string;
}

interface AttackFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function AttackForm({ value, onChange }: AttackFormProps) {
  const [attacks, setAttacks] = useState<Attack[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setAttacks(parsed);
      } else if (value) {
        // Fallback for legacy comma-separated string
        setAttacks(value.split(",").map(a => ({ name: a.trim(), toHit: "", damage: "" })));
      }
    } catch {
      if (value) {
        setAttacks(value.split(",").map(a => ({ name: a.trim(), toHit: "", damage: "" })));
      } else {
        setAttacks([]);
      }
    }
  }, [value]);

  const updateAttacks = (newAttacks: Attack[]) => {
    setAttacks(newAttacks);
    onChange(JSON.stringify(newAttacks));
  };

  const addAttack = () => {
    updateAttacks([...attacks, { name: "", toHit: "", damage: "" }]);
  };

  const removeAttack = (index: number) => {
    updateAttacks(attacks.filter((_, i) => i !== index));
  };

  const handleAttackChange = (index: number, field: keyof Attack, newVal: string) => {
    const newAttacks = [...attacks];
    newAttacks[index] = { ...newAttacks[index], [field]: newVal };
    updateAttacks(newAttacks);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
          <Swords className="w-3.5 h-3.5" /> Ataques e Ações
        </Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addAttack}
          className="h-7 px-2 text-[10px] gap-1"
        >
          <Plus className="w-3 h-3" /> Add Ataque
        </Button>
      </div>

      <div className="space-y-2">
        {attacks.map((attack, index) => (
          <Card key={index} className="p-2 bg-muted/20 border-border/50">
            <div className="grid grid-cols-[1fr,60px,80px,auto] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Arma/Ação</Label>
                <Input 
                  value={attack.name}
                  onChange={(e) => handleAttackChange(index, "name", e.target.value)}
                  placeholder="Ex: Espada"
                  className="h-8 text-xs bg-background/50"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Bônus</Label>
                <Input 
                  value={attack.toHit}
                  onChange={(e) => handleAttackChange(index, "toHit", e.target.value)}
                  placeholder="+5"
                  className="h-8 text-xs bg-background/50 font-mono text-center"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Dano</Label>
                <Input 
                  value={attack.damage}
                  onChange={(e) => handleAttackChange(index, "damage", e.target.value)}
                  placeholder="1d8+3"
                  className="h-8 text-xs bg-background/50 font-mono text-center"
                />
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => removeAttack(index)}
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
        {attacks.length === 0 && (
          <p className="text-center py-4 text-[10px] text-muted-foreground italic border border-dashed rounded-md bg-muted/5">
            Nenhum ataque adicionado.
          </p>
        )}
      </div>
    </div>
  );
}