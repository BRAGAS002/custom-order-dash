import { Sparkles, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Design Tools",
    description: "Generate custom designs with our built-in AI image generation tool. Create professional prints without design experience.",
  },
  {
    icon: MessageSquare,
    title: "Smart Chatbot Support",
    description: "Get instant answers to your questions with our AI chatbot. Real-time assistance for orders, pricing, and specifications.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Job Tracking",
    description: "Track your print jobs from order placement to completion with automated status updates and invoicing.",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="mb-4">AI-Enhanced Printing Platform</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            UniPrint combines traditional printing services with cutting-edge AI technology to streamline operations and enhance customer experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-border shadow-card hover:shadow-card-hover transition-smooth">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex p-3 rounded-lg gradient-primary">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
