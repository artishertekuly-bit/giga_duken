import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Кіру — Giga." }] }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Қош келдіңіз!");
    navigate({ to: "/" });
  };

  const google = async () => {
    await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="glass rounded-2xl p-8">
        <h1 className="font-display text-3xl font-bold">Кіру</h1>
        <p className="text-sm text-muted-foreground mt-1">Аккаунтыңызға қош келдіңіз</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 rounded-lg bg-card border border-border px-3 focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Құпия сөз</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-lg bg-card border border-border px-3 focus:border-primary focus:outline-none" />
          </div>
          <Button type="submit" size="lg" className="btn-primary w-full" disabled={loading}>
            {loading ? "Кірілуде..." : "Кіру"}
          </Button>
        </form>
        <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">немесе</span><div className="flex-1 h-px bg-border" /></div>
        <Button variant="outline" size="lg" className="w-full" onClick={google}>Google арқылы кіру</Button>
        <p className="text-sm text-center text-muted-foreground mt-6">
          Аккаунтыңыз жоқ па? <Link to="/register" className="text-accent hover:underline">Тіркелу</Link>
        </p>
      </div>
    </div>
  );
}
