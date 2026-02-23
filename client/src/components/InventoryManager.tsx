import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInventory } from "@/hooks/use-inventory";
import type { InventoryTemplate } from "@/hooks/use-inventory";
import { Plus, FolderPlus, Trash2, Search, Skull, Shield, Package, User, Copy, CopyPlus, ArrowRightLeft, Settings2 } from "lucide-react";
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

import { EditInventoryForm } from "./EditInventoryForm";

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
  const [editingTemplate, setEditingTemplate] = useState<InventoryTemplate | null>(null);

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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="Buscar no Grimório..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background/40 border-border/50 focus:bg-background/80 transition-all rounded-xl h-11"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-48">
                <Input 
                  placeholder="Nova Pasta..." 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="bg-background/40 border-border/50 h-11 rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCatName) {
                      addCategory(newCatName);
                      setNewCatName("");
                    }
                  }}
                />
              </div>
              <Button 
                variant="secondary"
                size="icon" 
                className="h-11 w-11 rounded-xl shrink-0 shadow-sm"
                onClick={() => { if(newCatName) { addCategory(newCatName); setNewCatName(""); } }}
              >
                <FolderPlus className="w-5 h-5 text-primary" />
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="bg-muted/30 p-1 w-full justify-start overflow-x-auto no-scrollbar border border-border/50 rounded-xl mb-4 h-auto flex-wrap sm:flex-nowrap">
              <TabsTrigger 
                value="all" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-xs font-bold uppercase tracking-wider"
              >
                Tudo
              </TabsTrigger>
              {categories.map(cat => (
                <div key={cat.id} className="relative group/tab">
                  <TabsTrigger 
                    value={cat.id}
                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-xs font-bold uppercase tracking-wider"
                  >
                    {cat.name}
                  </TabsTrigger>
                  {!["players", "allies", "enemies"].includes(cat.id) && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeCategory(cat.id); setActiveTab("all"); }}
                      className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-1 opacity-0 group-hover/tab:opacity-100 transition-all hover:scale-110 shadow-md"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              ))}
            </TabsList>

            <ScrollArea className="flex-1 border border-border/30 rounded-2xl bg-muted/10 p-4 shadow-inner">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <div 
                    key={template.id}
                    className="group relative bg-card/40 border border-border/50 p-4 rounded-xl hover:border-primary/40 hover:bg-primary/[0.03] transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none transition-transform group-hover:scale-125 group-hover:opacity-10">
                       {template.type === "enemy" ? <Skull className="w-16 h-16" /> : (template.type === "ally" ? <Shield className="w-16 h-16" /> : <User className="w-16 h-16" />)}
                    </div>

                    <div className="flex items-start gap-3 mb-3 relative z-10">
                      <div className={cn(
                        "p-2 rounded-lg shadow-inner",
                        template.type === "enemy" ? "bg-destructive/10 text-destructive" : (template.type === "ally" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500")
                      )}>
                        {template.type === "enemy" ? <Skull className="w-4 h-4" /> : (template.type === "ally" ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-display font-bold text-sm block truncate group-hover:text-primary transition-colors">{template.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                          {template.type === "enemy" ? "Monstro" : template.type === "ally" ? "Aliado" : "Jogador"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 relative z-10 pt-2 border-t border-border/30">
                      {template.type !== "player" && (
                        <>
                          <div className="flex flex-col items-center p-1.5 rounded-lg bg-background/30 border border-border/20">
                            <span className="text-[8px] uppercase font-bold text-muted-foreground">Vida</span>
                            <span className="text-xs font-bold text-red-500">{template.hp || '—'}</span>
                          </div>
                          <div className="flex flex-col items-center p-1.5 rounded-lg bg-background/30 border border-border/20">
                            <span className="text-[8px] uppercase font-bold text-muted-foreground">Defesa</span>
                            <span className="text-xs font-bold text-blue-500">{template.ac || '10'}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-[-10px] group-hover:translate-y-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="secondary" size="icon" className="h-7 w-7 rounded-lg shadow-sm border border-border/50">
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-md border-border/50 shadow-2xl rounded-xl">
                          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-3 py-2">Gerenciar</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); duplicateTemplate(template); }} className="rounded-lg m-1">
                            <CopyPlus className="w-4 h-4 mr-2 text-primary" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { 
                              e.stopPropagation();
                              setEditingTemplate(template);
                            }} className="rounded-lg m-1">
                            <Settings2 className="w-4 h-4 mr-2 text-primary" />
                            Editar Dados
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/30" />
                          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-3 py-1">Categorizar</DropdownMenuLabel>
                          {categories.filter(c => c.id !== template.categoryId).map(cat => (
                            <DropdownMenuItem key={cat.id} onClick={(e) => { e.stopPropagation(); moveTemplate(template, cat.id); }} className="rounded-lg m-1">
                              <ArrowRightLeft className="w-3 h-3 mr-2 text-muted-foreground" />
                              {cat.name}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator className="bg-border/30" />
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); removeTemplate(template.id); }} className="text-destructive focus:bg-destructive/10 rounded-lg m-1">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir Para Sempre
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {filteredTemplates.length === 0 && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-muted-foreground gap-4 animate-in fade-in duration-500">
                    <div className="p-4 rounded-full bg-muted/20 border border-border/20">
                      <Package className="w-12 h-12 opacity-20" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">Grimório Vazio</p>
                      <p className="text-sm opacity-60">Crie novos combatentes abaixo.</p>
                    </div>
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

        {editingTemplate && (
          <EditInventoryForm
            template={editingTemplate}
            open={!!editingTemplate}
            onOpenChange={(open) => !open && setEditingTemplate(null)}
            onSave={(id, updates) => {
              updateTemplate(id, updates);
              setEditingTemplate(null);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
