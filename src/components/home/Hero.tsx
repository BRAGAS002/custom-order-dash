import { Button } from "@/components/ui/button";
import { ArrowRight, Store } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-marketplace.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-10" />
      
      <div className="container relative py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Store className="h-4 w-4" />
              Multi-Vendor Marketplace
            </div>
            
            <h1 className="text-foreground">
              Order From Your Favorite Local Businesses
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-xl">
              Discover restaurants, shops, and services near you. Customize every detail of your order and track it in real-time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/enterprises">
                  Browse Businesses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button variant="outline" size="xl" asChild>
                <Link to="/business">
                  For Business Owners
                </Link>
              </Button>
            </div>

            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Local Businesses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Orders Delivered</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-full" />
            <img 
              src={heroImage}
              alt="Marketplace showcasing various products and services"
              className="relative rounded-2xl shadow-card-hover w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
