import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Download, RotateCcw } from "lucide-react";
import { useState } from "react";

const AIDesignTool = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedImage("https://images.unsplash.com/photo-1634942537034-2531766767d1?w=800&h=800&fit=crop");
      setIsGenerating(false);
    }, 2000);
  };

  const handleReset = () => {
    setPrompt("");
    setGeneratedImage(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 gradient-primary bg-clip-text text-transparent">AI Design Tool</h1>
          <p className="text-muted-foreground">Create custom designs for your print jobs using AI</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Design Prompt
              </CardTitle>
              <CardDescription>
                Describe what you want to create and let AI generate it for you
              </CardDescription>
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
                    "Company logo concept"
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleGenerate} 
                  disabled={!prompt.trim() || isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Design
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Generated Design</CardTitle>
              <CardDescription>
                Your AI-generated design will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {generatedImage ? (
                  <img 
                    src={generatedImage} 
                    alt="Generated design" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-muted-foreground p-8">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your generated design will appear here</p>
                  </div>
                )}
              </div>

              {generatedImage && (
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Use for Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AIDesignTool;
