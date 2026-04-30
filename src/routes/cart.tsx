import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { kzt } from "@/lib/format";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Себет — Giga." }] }),
  component: CartPage,
});

function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCartStore();
  const subtotal = total();
  const delivery = subtotal >= 50000 || subtotal === 0 ? 0 : 3500;
  const grand = subtotal + delivery;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
        <h1 className="font-display text-3xl font-bold">Себет бос</h1>
        <p className="text-muted-foreground mt-2">Өнімдерді қосып бастаңыз.</p>
        <Link to="/products"><Button className="btn-primary mt-6">Өнімдерге өту</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Менің себетім</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="glass rounded-xl divide-y divide-border/50">
          {items.map((i) => (
            <div key={i.id} className="p-4 flex gap-4 items-center">
              {i.image_url && <img src={i.image_url} alt="" className="w-20 h-20 rounded-lg object-cover bg-black/40" />}
              <div className="flex-1 min-w-0">
                <Link to="/products/$slug" params={{ slug: i.slug }} className="font-medium hover:text-primary line-clamp-1">{i.name_kz}</Link>
                <div className="text-sm text-muted-foreground mt-1">{kzt(i.price)}</div>
              </div>
              <div className="flex items-center gap-1 border border-border rounded-lg">
                <button className="p-2" onClick={() => updateQuantity(i.id, i.quantity - 1)}><Minus className="h-3.5 w-3.5" /></button>
                <span className="w-8 text-center text-sm">{i.quantity}</span>
                <button className="p-2" onClick={() => updateQuantity(i.id, i.quantity + 1)}><Plus className="h-3.5 w-3.5" /></button>
              </div>
              <div className="w-24 text-right font-medium hidden sm:block">{kzt(i.price * i.quantity)}</div>
              <button onClick={() => removeItem(i.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-6 h-max sticky top-20">
          <h2 className="font-display font-bold text-xl mb-4">Тапсырыс қорытындысы</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Тауарлар</span><span>{kzt(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Жеткізу</span><span>{delivery ? kzt(delivery) : "Тегін"}</span></div>
            <div className="border-t border-border/50 pt-3 flex justify-between font-display text-lg font-bold"><span>Барлығы</span><span>{kzt(grand)}</span></div>
          </div>
          <Link to="/checkout"><Button size="lg" className="btn-primary w-full mt-6">Тапсырыс беру →</Button></Link>
        </div>
      </div>
    </div>
  );
}
