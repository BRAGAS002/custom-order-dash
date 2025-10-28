import { Sparkles, Package, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "Fully Customizable",
    description: "Every product can be tailored to your exact preferences. Choose sizes, options, colors, and add special instructions.",
  },
  {
    icon: Package,
    title: "Real-Time Tracking",
    description: "Know exactly where your order is at every step. From kitchen to doorstep, stay informed with live updates.",
  },
  {
    icon: TrendingUp,
    title: "Support Local",
    description: "Every order supports local businesses in your community. Discover hidden gems and favorites near you.",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="mb-4">Why Choose OrderFlow</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience a new way to order from local businesses with powerful features designed for you
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
