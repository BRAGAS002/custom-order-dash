import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ReportDialogProps {
  reportedId: string;
  reportedType: "shop" | "service" | "user";
  triggerLabel?: string;
}

const REASONS = [
  "Inappropriate content",
  "Misleading information",
  "Scam or fraud",
  "Poor service quality",
  "Offensive behavior",
  "Other",
];

export function ReportDialog({ reportedId, reportedType, triggerLabel }: ReportDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) { toast.error("Please sign in to report"); return; }
    if (!reason) { toast.error("Please select a reason"); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("user_reports").insert({
        reporter_id: user.id,
        reported_id: reportedId,
        reported_type: reportedType,
        reason,
        description: description || null,
      });
      if (error) throw error;
      toast.success("Report submitted. Our team will review it.");
      setOpen(false);
      setReason("");
      setDescription("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="h-4 w-4 mr-1" />
          {triggerLabel || "Report"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {reportedType === "shop" ? "Shop" : reportedType === "service" ? "Service" : "User"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Additional Details</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Provide more context..." />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Flag className="h-4 w-4 mr-2" />}
            Submit Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
