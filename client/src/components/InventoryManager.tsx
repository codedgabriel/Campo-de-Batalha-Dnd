import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInventory } from "@/hooks/use-inventory";
import type { InventoryTemplate } from "@/hooks/use-inventory";
import { Plus, FolderPlus, Trash2, Search, Skull, Shield, Package, User, Copy, CopyPlus, ArrowRightLeft } from "lucide-react";
import { AddCharacterForm } from "./AddCharacterForm";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InventoryManagerProps {
  onSelect: (template: InventoryTemplate) => void;
  onAddCharacter: (name: string, type: "player" | "enemy" | "ally", initiative: number, count: number, image?: string, hp?: number, initiativeModifier?: number, ac?: number, attacks?: string) => void;
}

export function InventoryManager({ onSelect, onAddCharacter }: InventoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const { categories, templates, addCategory, removeCategory, addTemplate, removeTemplate, updateTemplate } = useInventory();
  const [activeTab, setActiveTab] = useState("all");

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) && 
    (activeTab === "all" || t.categoryId === activeTab)
  );

  const handleTemplateSelect = (template: InventoryTemplate) => {
    onSelect(template);
    setIsOpen(false);
  };

  const duplicateTemplate = (template: InventoryTemplate) => {
    addTemplate({
      ...template,
      name: `${template.name} (Cópia)`,
    });
  };

  const moveTemplate = (template: InventoryTemplate, newCategoryId: string) => {
    updateTemplate(template.id, { categoryId: newCategoryId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          variant="outline"
          className="w-full border-primary/50 hover:bg-primary/10 text-primary font-bold rounded-full h-12"
        >
          <Plus className="w-5 h-5 mr-2" />
          Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-card border-border/50 backdrop-blur-xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-display text-primary flex items-center gap-2">
            <Package className="w-6 h-6" />
            Inventário
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4 flex-1 flex flex-col min-h-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar no Inventário..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Nova Categoria" 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-40 bg-background/50"
              />
              <Button size="icon" onClick={() => { if(newCatName) { addCategory(newCatName); setNewCatName(""); } }}>
                <FolderPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="bg-background/50 w-full justify-start overflow-x-auto no-scrollbar">
              <TabsTrigger value="all">Todos</TabsTrigger>
              {categories.map(cat => (
                <div key={cat.id} className="relative group">
                  <TabsTrigger value={cat.id}>{cat.name}</TabsTrigger>
                  {!["players", "allies", "enemies"].includes(cat.id) && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeCategory(cat.id); setActiveTab("all"); }}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-2 h-2" />
                    </button>
                  )}
                </div>
              ))}
            </TabsList>

            <ScrollArea className="flex-1 mt-4 border rounded-lg bg-background/20 p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredTemplates.map(template => (
                  <div 
                    key={template.id}
                    className="group relative bg-card/50 border border-border/50 p-3 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {template.type === "enemy" ? <Skull className="w-4 h-4 text-destructive" /> : (template.type === "ally" ? <Shield className="w-4 h-4 text-green-500" /> : <User className="w-4 h-4 text-blue-500" />)}
                      <span className="font-bold text-sm truncate">{template.name}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground flex justify-between">
                      {template.type !== "player" && template.hp !== undefined && (
                        <>
                          <span>HP {template.maxHp}</span>
                          <span>CA {template.ac}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); duplicateTemplate(template); }}>
                            <CopyPlus className="w-4 h-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase px-2 py-1">Mover para</DropdownMenuLabel>
                          {categories.filter(c => c.id !== template.categoryId).map(cat => (
                            <DropdownMenuItem key={cat.id} onClick={(e) => { e.stopPropagation(); moveTemplate(template, cat.id); }}>
                              <ArrowRightLeft className="w-3 h-3 mr-2" />
                              {cat.name}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); removeTemplate(template.id); }} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {filteredTemplates.length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground text-sm">
                    Nada encontrado aqui.
                  </div>
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        <div className="p-6 pt-2 border-t bg-muted/20">
          <AddCharacterForm 
            onAdd={(name, type, init, count, img, hp, initMod, ac, atk) => {
              onAddCharacter(name, type, init, count, img, hp, initMod, ac, atk);
              setIsOpen(false);
            }} 
            onSaveToInventory={(name, type, hp, ac, initMod, atk, img) => {
              // Auto-categorize based on type
              let categoryId = "";
              if (type === "player") categoryId = "players";
              else if (type === "ally") categoryId = "allies";
              else if (type === "enemy") categoryId = "enemies";

              addTemplate({
                name,
                type: type as "enemy" | "ally" | "player",
                hp: hp || 0,
                maxHp: hp || 0,
                ac: ac || 10,
                initiativeModifier: initMod || 0,
                attacks: atk || "",
                image: img,
                categoryId: categoryId || (activeTab === "all" ? "" : activeTab)
              });
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
