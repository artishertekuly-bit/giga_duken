import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, ShoppingBag, Package, LogOut } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !profileLoading) {
      if (!user || !profile?.is_admin) {
        navigate({ to: "/" });
      }
    }
  }, [user, profile, loading, profileLoading, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  if (!user || !profile?.is_admin) {
    return null;
  }

  const adminNav = [
    { to: "/admin", label: "Басты бет", icon: LayoutDashboard },
    { to: "/admin/orders", label: "Тапсырыстар", icon: ShoppingBag },
    { to: "/admin/products", label: "Тауарлар", icon: Package },
    { to: "/admin/users", label: "Қолданушылар", icon: Users },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="glass rounded-xl p-4 sticky top-24">
            <h2 className="font-display font-bold text-lg mb-4 px-2">Админ панель</h2>
            <nav className="flex flex-col gap-1">
              {adminNav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition hover:bg-secondary/50"
                  activeProps={{ className: "text-primary bg-primary/10 font-medium" }}
                  activeOptions={{ exact: n.to === "/admin" }}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition"
              >
                <LogOut className="h-4 w-4" />
                Сайтқа қайту
              </Link>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
