
import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const { user, loading, signIn, signUp } = useSupabaseAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Already authenticated -> go home
      navigate("/");
    }
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    if (mode === "login") {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-center">
              {mode === "login" ? "Log in to Shelf Buddy" : "Create your Shelf Buddy account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {mode === "login" ? "Log In" : "Sign Up"}
              </Button>
            </form>

            <div className="flex items-center justify-between mt-4 text-sm">
              <button
                className="text-primary underline underline-offset-4"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                disabled={loading}
              >
                {mode === "login" ? "Create an account" : "Already have an account? Log in"}
              </button>
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
