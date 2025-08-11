import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    return () => subscription.unsubscribe();
  }, [navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        toast({ title: "Успешна регистрация", description: "Проверете имейла си за потвърждение." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Влязохте успешно" });
      }
    } catch (err: any) {
      toast({ title: "Грешка", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (session) return null;

  return (
    <>
      <Helmet>
        <title>Вход – Домова каса онлайн</title>
        <meta name="description" content="Вход за домоуправител – достъп до таблото и управлението." />
        <link rel="canonical" href="/auth" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-surface">
          <CardHeader>
            <CardTitle>{isSignUp ? "Регистрация" : "Вход за домоуправител"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-1">
                <Label htmlFor="email">Имейл</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="password">Парола</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" variant="hero" disabled={loading}>
                {loading ? "Моля, изчакайте..." : isSignUp ? "Създай акаунт" : "Вход"}
              </Button>
              <div className="text-sm text-muted-foreground">
                {isSignUp ? (
                  <span>
                    Имате акаунт?{" "}
                    <button type="button" className="underline" onClick={() => setIsSignUp(false)}>
                      Вход
                    </button>
                  </span>
                ) : (
                  <span>
                    Нямате акаунт?{" "}
                    <button type="button" className="underline" onClick={() => setIsSignUp(true)}>
                      Регистрация
                    </button>
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Проблем с входа? Уверете се, че Site URL и Redirect URLs са настроени в Supabase.
              </div>
              <div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">Към началото</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
