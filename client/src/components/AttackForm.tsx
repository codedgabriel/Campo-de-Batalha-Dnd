import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Swords } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
        setAttacks(value.split(",").map(a => ({ name: a.trim(), toHit: "0", damage: "1d6+0" })));
      }
    } catch {
      if (value) {
        setAttacks(value.split(",").map(a => ({ name: a.trim(), toHit: "0", damage: "1d6+0" })));
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
    updateAttacks([...attacks, { name: "", toHit: "0", damage: "1d6+0" }]);
  };

  const removeAttack = (index: number) => {
    updateAttacks(attacks.filter((_, i) => i !== index));
  };

  const handleAttackChange = (index: number, field: keyof Attack, newVal: string) => {
    const newAttacks = [...attacks];
    newAttacks[index] = { ...newAttacks[index], [field]: newVal };
    updateAttacks(newAttacks);
  };

  const damagePresets = ["1d4", "1d6", "1d8", "1d10", "1d12", "2d6"];

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
          className="h-7 px-2 text-[10px] gap-1 border-primary/30 text-primary hover:bg-primary/10"
        >
          <Plus className="w-3 h-3" /> Adicionar Arma
        </Button>
      </div>

      <div className="space-y-3">
        {attacks.map((attack, index) => (
          <Card key={index} className="p-3 bg-muted/20 border-border/50 relative group">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={() => removeAttack(index)}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-destructive/90 z-10"
            >
              <Trash2 className="w-3 h-3" />
            </Button>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Nome da Arma</Label>
                <Input 
                  value={attack.name}
                  onChange={(e) => handleAttackChange(index, "name", e.target.value)}
                  placeholder="Ex: Espada Curta"
                  className="h-9 text-xs bg-background/50 border-border/40 focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground text-blue-500/80">Bônus de Acerto</Label>
                  <div className="relative">
                    <Input 
                      value={attack.toHit}
                      onChange={(e) => handleAttackChange(index, "toHit", e.target.value)}
                      placeholder="+0"
                      className="h-9 text-xs bg-background/50 border-border/40 focus:border-primary/50 pl-7 font-mono"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">+</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground text-red-500/80">Bônus de Dano</Label>
                  <div className="relative">
                    <Input 
                      value={attack.damage.includes("+") ? attack.damage.split("+")[1] : "0"}
                      onChange={(e) => {
                        const parts = attack.damage.split("+");
                        const base = parts[0] || "1d6";
                        handleAttackChange(index, "damage", `${base}+${e.target.value}`);
                      }}
                      placeholder="0"
                      className="h-9 text-xs bg-background/50 border-border/40 focus:border-primary/50 pl-7 font-mono"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">+</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Dado de Dano</Label>
                <div className="flex flex-wrap gap-1.5">
                  {damagePresets.map(d => (
                    <Button
                      key={d}
                      type="button"
                      variant={attack.damage.startsWith(d) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const parts = attack.damage.split("+");
                        const bonus = parts[1] || "0";
                        handleAttackChange(index, "damage", `${d}+${bonus}`);
                      }}
                      className={cn(
                        "h-7 px-2 text-[10px] font-mono",
                        attack.damage.startsWith(d) ? "bg-primary text-primary-foreground" : "hover:border-primary/50"
                      )}
                    >
                      {d}
                    </Button>
                  ))}
                  <div className="relative flex-1 min-w-[60px]">
                    <Input 
                      value={attack.damage.split("+")[0]}
                      onChange={(e) => {
                        const parts = attack.damage.split("+");
                        const bonus = parts[1] || "0";
                        handleAttackChange(index, "damage", `${e.target.value}+${bonus}`);
                      }}
                      placeholder="Outro"
                      className="h-7 text-[10px] bg-background/50 border-border/40 font-mono py-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {attacks.length === 0 && (
          <div className="text-center py-6 px-4 border border-dashed rounded-xl bg-muted/5 space-y-2">
            <Swords className="w-8 h-8 mx-auto text-muted-foreground/20" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Nenhuma arma empunhada
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
