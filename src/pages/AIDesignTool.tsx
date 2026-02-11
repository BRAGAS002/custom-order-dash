import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Download, RotateCcw, Loader2, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const AIDesignTool = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: history } = useQuery({
    queryKey: ["ai-generations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("ai_image_generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!user) {
      toast.error("Please sign in to use the AI Design Tool");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-design", {
        body: { prompt },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setGeneratedImage(data.image_url);
      toast.success("Design generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate design");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `uniprint-design-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download image");
    }
  };

  const handleReset = () => {
    setPrompt("");
    setGeneratedImage(null);
  };

  // Count today's generations
  const todayCount = history?.filter((h) => {
    const d = new Date(h.created_at!);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 gradient-primary bg-clip-text text-transparent">AI Design Tool</h1>
          <p className="text-muted-foreground">Create custom designs for your print jobs using AI</p>
          {user && (
            <p className="text-sm text-muted-foreground mt-1">
              {5 - todayCount} generations remaining today
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Design Prompt
              </CardTitle>
              <CardDescription>Describe what you want to create and let AI generate it for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="E.g., 'Professional business card with mountain theme, blue and white colors, minimalist style'"
                className="min-h-[200px] resize-none"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Suggested Prompts:</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Modern business card design",
                    "Event flyer with vibrant colors",
                    "Elegant wedding invitation",
                    "Company logo concept",
                  ].map((suggestion) => (
                    <Button key={suggestion} variant="outline" size="sm" onClick={() => setPrompt(suggestion)}>
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating || !user} className="flex-1">
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" />Generate Design</>
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset}><RotateCcw className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Generated Design</CardTitle>
              <CardDescription>Your AI-generated design will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {isGenerating ? (
                  <div className="text-center text-muted-foreground p-8">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                    <p>Generating your design...</p>
                    <p className="text-xs mt-2">This may take a moment</p>
                  </div>
                ) : generatedImage ? (
                  <img src={generatedImage} alt="Generated design" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-muted-foreground p-8">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your generated design will appear here</p>
                  </div>
                )}
              </div>
              {generatedImage && (
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* History */}
        {history && history.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Your Designs</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {history.filter((h) => h.status === "completed" && h.image_url).map((gen) => (
                <Card key={gen.id} className="overflow-hidden cursor-pointer hover:shadow-card-hover transition-smooth" onClick={() => setGeneratedImage(gen.image_url)}>
                  <div className="aspect-square">
                    <img src={gen.image_url!} alt={gen.prompt} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">{gen.prompt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AIDesignTool;
