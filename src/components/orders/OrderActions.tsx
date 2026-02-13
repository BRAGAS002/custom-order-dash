import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { XCircle, CheckCircle2, Clock, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface OrderActionsProps {
  order: {
    id: string;
    order_number: string;
    order_status: string | null;
    customer_id: string | null;
    shop_id: string;
  };
}

export function OrderActions({ order }: OrderActionsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: designFiles, refetch: refetchFiles } = useQuery({
    queryKey: ["order-design-files", order.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_design_files")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const status = order.order_status ?? "pending";
  const isCustomer = order.customer_id === user?.id;
  const canCancel = isCustomer && ["pending", "confirmed"].includes(status);
  const canConfirmComplete = isCustomer && status === "ready";
  const canUploadDesign = isCustomer && !["completed", "cancelled"].includes(status);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { error } = await supabase.from("orders").update({
        order_status: "cancelled",
        cancellation_reason: cancelReason || null,
        cancelled_at: new Date().toISOString(),
      }).eq("id", order.id);
      if (error) throw error;

      if (user) {
        await supabase.from("order_status_history").insert({
          order_id: order.id,
          status: "cancelled",
          changed_by: user.id,
          notes: cancelReason || "Cancelled by customer",
        });
      }

      toast.success("Order cancelled");
      queryClient.invalidateQueries({ queryKey: ["order-detail"] });
      queryClient.invalidateQueries({ queryKey: ["order-history"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmComplete = async () => {
    setConfirming(true);
    try {
      const { error } = await supabase.from("orders").update({
        order_status: "completed",
        completed_at: new Date().toISOString(),
      }).eq("id", order.id);
      if (error) throw error;

      if (user) {
        await supabase.from("order_status_history").insert({
          order_id: order.id,
          status: "completed",
          changed_by: user.id,
          notes: "Confirmed received by customer",
        });
      }

      toast.success("Order confirmed as complete!");
      queryClient.invalidateQueries({ queryKey: ["order-detail"] });
      queryClient.invalidateQueries({ queryKey: ["order-history"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm");
    } finally {
      setConfirming(false);
    }
  };

  const handleUploadDesign = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20MB");
      return;
    }

    setUploading(true);
    try {
      const filePath = `${order.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("design-files")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("design-files").getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("order_design_files").insert({
        order_id: order.id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
      });
      if (dbError) throw dbError;

      toast.success("Design file uploaded!");
      refetchFiles();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Actions & Files</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {canConfirmComplete && (
            <Button onClick={handleConfirmComplete} disabled={confirming} className="gap-2">
              {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Confirm Received
            </Button>
          )}

          {canCancel && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <XCircle className="h-4 w-4" /> Cancel Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Cancel Order {order.order_number}?</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Reason (optional)</Label>
                    <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Why are you cancelling?" rows={3} />
                  </div>
                  <Button variant="destructive" className="w-full" onClick={handleCancel} disabled={cancelling}>
                    {cancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Confirm Cancellation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Design file upload */}
        {canUploadDesign && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Upload Design File</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild disabled={uploading}>
                <label className="cursor-pointer gap-2">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Choose File
                  <input type="file" className="hidden" onChange={handleUploadDesign} accept=".pdf,.png,.jpg,.jpeg,.ai,.psd,.svg,.eps" />
                </label>
              </Button>
              <span className="text-xs text-muted-foreground">PDF, PNG, JPG, AI, PSD, SVG (max 20MB)</span>
            </div>
          </div>
        )}

        {/* Uploaded files list */}
        {designFiles && designFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Design Files</Label>
            {designFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-2 border rounded-lg text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate">{file.file_name}</span>
                  <Badge variant={file.status === "approved" ? "default" : file.status === "rejected" ? "destructive" : "secondary"} className="text-xs shrink-0">
                    {file.status}
                  </Badge>
                </div>
                <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline shrink-0">View</a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
