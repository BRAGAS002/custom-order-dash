import { ShoppingCart, User, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
            UniPrint
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/enterprises" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
            Printing Shops
          </Link>
          <Link to="/orders" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
            My Orders
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
