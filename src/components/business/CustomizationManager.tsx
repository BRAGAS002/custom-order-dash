import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface CustomizationManagerProps {
  serviceId: string;
  serviceName: string;
}

export function CustomizationManager({ serviceId, serviceName }: CustomizationManagerProps) {
  const queryClient = useQueryClient();
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showAddOption, setShowAddOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newGroup, setNewGroup] = useState({ name: "", description: "", is_required: false });
  const [newOption, setNewOption] = useState({ name: "", price_modifier: 0 });

  const { data: groups, isLoading } = useQuery({
    queryKey: ["service-customizations", serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customization_groups")
        .select("*, customization_options(*)")
        .eq("product_id", serviceId)
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const handleAddGroup = async () => {
    if (!newGroup.name.trim()) { toast.error("Name is required"); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("customization_groups").insert({
        product_id: serviceId,
        name: newGroup.name.trim(),
        description: newGroup.description.trim() || null,
        is_required: newGroup.is_required,
        display_order: (groups?.length ?? 0) + 1,
      });
      if (error) throw error;
      toast.success("Group added!");
      setShowAddGroup(false);
      setNewGroup({ name: "", description: "", is_required: false });
      queryClient.invalidateQueries({ queryKey: ["service-customizations", serviceId] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddOption = async (groupId: string) => {
    if (!newOption.name.trim()) { toast.error("Name is required"); return; }
    setSubmitting(true);
    try {
      const group = groups?.find((g) => g.id === groupId);
      const optCount = group?.customization_options?.length ?? 0;
      const { error } = await supabase.from("customization_options").insert({
        group_id: groupId,
        name: newOption.name.trim(),
        price_modifier: newOption.price_modifier,
        display_order: optCount + 1,
      });
      if (error) throw error;
      toast.success("Option added!");
      setShowAddOption(null);
      setNewOption({ name: "", price_modifier: 0 });
      queryClient.invalidateQueries({ queryKey: ["service-customizations", serviceId] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      // Delete options first
      await supabase.from("customization_options").delete().eq("group_id", groupId);
      const { error } = await supabase.from("customization_groups").delete().eq("id", groupId);
      if (error) throw error;
      toast.success("Group deleted");
      queryClient.invalidateQueries({ queryKey: ["service-customizations", serviceId] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    try {
      const { error } = await supabase.from("customization_options").delete().eq("id", optionId);
      if (error) throw error;
      toast.success("Option deleted");
      queryClient.invalidateQueries({ queryKey: ["service-customizations", serviceId] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Customizations for {serviceName}</h3>
        <Dialog open={showAddGroup} onOpenChange={setShowAddGroup}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Group</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Customization Group</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>Group Name *</Label><Input value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} placeholder="e.g. Paper Type" /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} placeholder="Optional description" /></div>
              <div className="flex items-center gap-2"><Switch checked={newGroup.is_required} onCheckedChange={(v) => setNewGroup({ ...newGroup, is_required: v })} /><Label>Required</Label></div>
              <Button className="w-full" onClick={handleAddGroup} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}Add Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {groups && groups.length > 0 ? (
        groups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{group.name}</CardTitle>
                  {group.is_required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                </div>
                <div className="flex gap-1">
                  <Dialog open={showAddOption === group.id} onOpenChange={(open) => { setShowAddOption(open ? group.id : null); if (!open) setNewOption({ name: "", price_modifier: 0 }); }}>
                    <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />Option</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Option to {group.name}</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2"><Label>Option Name *</Label><Input value={newOption.name} onChange={(e) => setNewOption({ ...newOption, name: e.target.value })} placeholder="e.g. Glossy" /></div>
                        <div className="space-y-2"><Label>Price Modifier (₱)</Label><Input type="number" value={newOption.price_modifier} onChange={(e) => setNewOption({ ...newOption, price_modifier: Number(e.target.value) })} /></div>
                        <Button className="w-full" onClick={() => handleAddOption(group.id)} disabled={submitting}>
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Add Option
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteGroup(group.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </div>
              {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
            </CardHeader>
            <CardContent>
              {group.customization_options && group.customization_options.length > 0 ? (
                <div className="space-y-1">
                  {(group.customization_options as any[])
                    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                    .map((opt) => (
                      <div key={opt.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{opt.name}</span>
                          {opt.is_default && <Badge variant="outline" className="text-xs">Default</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          {Number(opt.price_modifier) !== 0 && (
                            <span className="text-sm text-primary font-medium">
                              {Number(opt.price_modifier) > 0 ? "+" : ""}₱{Number(opt.price_modifier).toLocaleString()}
                            </span>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteOption(opt.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">No options yet</p>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No customization groups yet. Add one to define options like paper type, finish, size, etc.</p>
      )}
    </div>
  );
}
