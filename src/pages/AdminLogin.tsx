import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // TODO: Implement actual admin authentication with Lovable Cloud
    // This should verify admin role from user_roles table
    console.log("Admin Login:", { email, password });
    
    setTimeout(() => {
      toast.success("Admin login successful!");
      setIsLoading(false);
      // Redirect to admin dashboard
      window.location.href = "/admin";
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-smooth">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Admin Login</h1>
          <p className="text-muted-foreground">Secure access for system administrators</p>
        </div>

        <Card className="shadow-card-hover border-primary/20">
          <CardHeader>
            <CardTitle>Administrator Access</CardTitle>
            <CardDescription>
              This area is restricted to authorized personnel only
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@uniprint.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Sign In as Admin"}
              </Button>
              <div className="text-center text-sm text-muted-foreground pt-2">
                <Link to="/login" className="text-primary hover:underline">
                  Regular User Login
                </Link>
              </div>
            </CardContent>
          </form>
        </Card>

        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-sm">
          <p className="text-warning flex items-center gap-2">
            <Shield className="h-4 w-4" />
            All admin login attempts are monitored and logged
          </p>
        </div>
      </div>
    </div>
  );
}
