import { ShoppingCart, User, Store, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const [cartCount] = useState(2); // Mock cart count
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
          <Link to="/ai-design" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
            AI Design
          </Link>
          {user && (
            <Link to="/orders" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              My Orders
            </Link>
          )}
          {userRole === "business" && (
            <Link to="/business" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              Dashboard
            </Link>
          )}
          {userRole === "admin" && (
            <Link to="/admin" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </Button>

          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
