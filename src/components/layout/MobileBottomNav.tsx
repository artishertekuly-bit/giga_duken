import { Link } from "@tanstack/react-router";
import { Home, Package, Cpu, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

export function MobileBottomNav() {
  const cartCount = useCartStore((s) => s.count());
  const items = [
    { to: "/", label: "Басты", icon: Home, exact: true, badge: 0 },
    { to: "/products", label: "Өнімдер", icon: Package, exact: false, badge: 0 },
    { to: "/builder", label: "Жинақ", icon: Cpu, exact: false, badge: 0 },
    { to: "/cart", label: "Себет", icon: ShoppingCart, exact: false, badge: cartCount },
    { to: "/profile", label: "Профиль", icon: User, exact: false, badge: 0 },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl">
      <div className="grid grid-cols-5">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            activeOptions={{ exact: it.exact }}
            activeProps={{ className: "text-primary" }}
            className="py-2 flex flex-col items-center gap-1 text-[10px] text-muted-foreground relative"
          >
            <it.icon className="h-5 w-5" />
            <span>{it.label}</span>
            {it.badge ? (
              <span className="absolute top-1 right-[28%] bg-primary text-primary-foreground text-[9px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">{it.badge}</span>
            ) : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}
