import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

export default function AdminLogin() {
  const { user, loading, signIn, userRole } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!loading && user && userRole === "admin") {
      navigate("/admin", { replace: true });
    } else if (!loading && user && userRole && userRole !== "admin") {
      toast.error("You do not have admin access");
    }
  }, [user, loading, userRole, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
      return;
    }

    // After sign in, check admin role via the has_role function
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: sessionData.session.user.id,
        _role: "admin",
      });

      if (!isAdmin) {
        toast.error("You do not have admin access");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
  };

  if (loading) return null;

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
