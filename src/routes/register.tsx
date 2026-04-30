import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Тіркелу — Giga." }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: form.full_name, phone: form.phone },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Тіркеу сәтті өтті!");
    navigate({ to: "/" });
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="glass rounded-2xl p-8">
        <h1 className="font-display text-3xl font-bold">Тіркелу</h1>
        <p className="text-sm text-muted-foreground mt-1">Giga. отбасына қосылыңыз</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {([
            ["full_name", "Аты-жөні", "text"],
            ["email", "Email", "email"],
            ["phone", "Телефон", "tel"],
            ["password", "Құпия сөз", "password"],
          ] as const).map(([k, label, type]) => (
            <div key={k}>
              <label className="text-sm font-medium block mb-1.5">{label}</label>
              <input required type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="w-full h-11 rounded-lg bg-card border border-border px-3 focus:border-primary focus:outline-none" />
            </div>
          ))}
          <Button type="submit" size="lg" className="btn-primary w-full" disabled={loading}>
            {loading ? "Тіркелуде..." : "Тіркелу"}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground mt-6">
          Аккаунтыңыз бар ма? <Link to="/login" className="text-accent hover:underline">Кіру</Link>
        </p>
      </div>
    </div>
  );
}
