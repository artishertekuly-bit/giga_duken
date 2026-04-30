import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Heart, User as UserIcon, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const nav = [
  { to: "/", label: "Басты бет" },
  { to: "/products", label: "Өнімдер" },
  { to: "/builder", label: "PC Жинақтаушы" },
  { to: "/compatibility", label: "Сәйкестік" },
];

export function Navbar() {
  const cartCount = useCartStore((s) => s.count());
  const wishCount = useWishlistStore((s) => s.ids.length);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/search", search: { q: q.trim() } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-background/70">
      <div className="container mx-auto px-4 flex items-center gap-6 h-16">
        <Link to="/" className="giga-logo text-2xl shrink-0">
          Giga<span className="dot">.</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md transition"
              activeProps={{ className: "text-foreground bg-secondary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <form onSubmit={submit} className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Өнім іздеу..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-card border border-border focus:border-primary focus:outline-none text-sm"
          />
        </form>
        <div className="flex items-center gap-1 ml-auto">
          <ThemeToggle />
          <Link to="/profile/wishlist" className="p-2 relative hover:text-primary transition" aria-label="Тілектер">
            <Heart className="h-5 w-5" />
            {wishCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">{wishCount}</span>
            )}
          </Link>
          <Link to="/cart" className="p-2 relative hover:text-primary transition" aria-label="Себет">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">{cartCount}</span>
            )}
          </Link>
          {user ? (
            <>
              {profile?.is_admin && (
                <Link to="/admin" className="p-2 hover:text-primary transition text-xs font-medium border border-border rounded-md px-3 bg-secondary/50">
                  Админ
                </Link>
              )}
              <Link to="/profile" className="p-2 hover:text-primary transition" aria-label="Профиль">
                <UserIcon className="h-5 w-5" />
              </Link>
            </>
          ) : (
            <Link to="/login" className="hidden sm:block">
              <Button size="sm" variant="outline">Кіру</Button>
            </Link>
          )}
          <button className="lg:hidden p-2" onClick={() => setMobileOpen((v) => !v)} aria-label="Меню">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            <form onSubmit={submit} className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Іздеу..."
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-card border border-border text-sm"
              />
            </form>
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm rounded-md hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
