import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Package, Heart, Cpu, LogOut } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Профиль — Giga." }] }),
  component: ProfileLayout,
});

function ProfileLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="container mx-auto p-12">Жүктелуде...</div>;
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Кіруіңіз қажет</h1>
        <Link to="/login"><Button className="btn-primary mt-4">Кіру</Button></Link>
      </div>
    );
  }

  const tabs = [
    { to: "/profile", label: "Жеке деректер", icon: User, exact: true },
    { to: "/profile/orders", label: "Тапсырыстарым", icon: Package, exact: false },
    { to: "/profile/wishlist", label: "Тілектер тізімі", icon: Heart, exact: false },
    { to: "/profile/builds", label: "Менің жинақтарым", icon: Cpu, exact: false },
  ] as const;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Менің профилім</h1>
      <div className="grid md:grid-cols-[240px_1fr] gap-6">
        <aside className="glass rounded-xl p-3 h-max space-y-1">
          {tabs.map((t) => (
            <Link key={t.to} to={t.to} activeOptions={{ exact: t.exact }}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-secondary"
              activeProps={{ className: "bg-primary/20 text-foreground" }}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </Link>
          ))}
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-destructive/20 text-destructive"
          >
            <LogOut className="h-4 w-4" /> Шығу
          </button>
        </aside>
        <div><Outlet /></div>
      </div>
    </div>
  );
}
