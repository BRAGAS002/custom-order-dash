import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DocumentUploadProps {
  shopId: string;
  currentDocuments: any;
  verificationStatus: string | null;
  onUpdate: () => void;
}

export function DocumentUpload({ shopId, currentDocuments, verificationStatus, onUpdate }: DocumentUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const docs = (currentDocuments as any[] | null) ?? [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }

    setUploading(true);
    try {
      const filePath = `${shopId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("business-documents")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("business-documents").getPublicUrl(filePath);

      const newDoc = {
        name: file.name,
        url: urlData.publicUrl,
        type: file.type,
        uploaded_at: new Date().toISOString(),
      };

      const updatedDocs = [...docs, newDoc];

      const { error } = await supabase.from("shops").update({
        business_documents: updatedDocs as any,
        verification_status: verificationStatus === "rejected" ? "pending" : verificationStatus,
      }).eq("id", shopId);
      if (error) throw error;

      toast.success("Document uploaded!");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const statusIcon = verificationStatus === "verified"
    ? <CheckCircle2 className="h-5 w-5 text-success" />
    : <AlertCircle className="h-5 w-5 text-warning" />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {statusIcon} Business Verification
            </CardTitle>
            <CardDescription>
              {verificationStatus === "verified"
                ? "Your business is verified"
                : verificationStatus === "rejected"
                  ? "Verification was rejected. Please upload updated documents."
                  : "Upload business documents for verification"}
            </CardDescription>
          </div>
          <Badge variant={verificationStatus === "verified" ? "default" : "secondary"} className="capitalize">
            {verificationStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {docs.length > 0 && (
          <div className="space-y-2">
            {docs.map((doc: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 border rounded-lg text-sm">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate flex-1">{doc.name}</span>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline shrink-0">View</a>
              </div>
            ))}
          </div>
        )}

        {verificationStatus !== "verified" && (
          <Button variant="outline" asChild disabled={uploading}>
            <label className="cursor-pointer gap-2">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload Document
              <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
            </label>
          </Button>
        )}

        <p className="text-xs text-muted-foreground">
          Accepted: Business permit, DTI/SEC registration, BIR certificate, valid ID (PDF, JPG, PNG — max 10MB)
        </p>
      </CardContent>
    </Card>
  );
}
