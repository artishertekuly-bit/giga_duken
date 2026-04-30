import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { kzt } from "@/lib/format";
import { toast } from "sonner";
import { Check } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Рәсімдеу — Giga." }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, total, clear } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "", phone: "", address: "", city: "Шымкент", payment: "card",
  });

  const subtotal = total();
  const delivery = subtotal >= 50000 ? 0 : 3500;
  const grand = subtotal + delivery;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Тапсырыс беру үшін жүйеге кіріңіз");
      navigate({ to: "/login" });
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.from("orders").insert({
      user_id: user.id,
      items: items as unknown as never,
      total_price: grand,
      status: "pending",
      delivery_address: form.address,
      city: form.city,
      phone: form.phone,
      full_name: form.full_name,
      payment_method: form.payment,
    }).select("id").single();
    setSubmitting(false);
    if (error) { toast.error("Қате: " + error.message); return; }
    clear();
    setSuccess(data.id);
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto"><Check className="h-8 w-8" /></div>
        <h1 className="font-display text-3xl font-bold mt-6">Тапсырыс қабылданды!</h1>
        <p className="text-muted-foreground mt-2">Тапсырыс нөмірі: <span className="font-mono">#{success.slice(0, 8)}</span></p>
        <Link to="/profile/orders"><Button className="btn-primary mt-6">Тапсырыстарымды көру</Button></Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Себет бос</h1>
        <Link to="/products"><Button className="btn-primary mt-4">Өнімдерге өту</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Тапсырысты рәсімдеу</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="glass rounded-xl p-6 space-y-4">
          {([
            ["full_name", "Аты-жөні", "text"],
            ["phone", "Телефон нөмірі", "tel"],
            ["address", "Жеткізу мекенжайы", "text"],
            ["city", "Қала", "text"],
          ] as const).map(([k, label, type]) => (
            <div key={k}>
              <label className="text-sm font-medium block mb-1.5">{label}</label>
              <input
                required
                type={type}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="w-full h-11 rounded-lg bg-card border border-border px-3 focus:border-primary focus:outline-none"
              />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium block mb-1.5">Төлем тәсілі</label>
            <div className="grid grid-cols-3 gap-2">
              {[["card", "Картамен"], ["cash", "Қолма-қол"], ["kaspi", "Kaspi Pay"]].map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm({ ...form, payment: v })}
                  className={`h-11 rounded-lg border text-sm transition ${form.payment === v ? "border-primary bg-primary/20" : "border-border hover:bg-secondary"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-6 h-max">
          <h2 className="font-display font-bold text-xl mb-4">Қорытынды</h2>
          <div className="space-y-1.5 text-sm mb-4">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between gap-2">
                <span className="text-muted-foreground line-clamp-1">{i.name_kz} × {i.quantity}</span>
                <span>{kzt(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border/50 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Жеткізу</span><span>{delivery ? kzt(delivery) : "Тегін"}</span></div>
            <div className="flex justify-between font-display text-lg font-bold"><span>Барлығы</span><span>{kzt(grand)}</span></div>
          </div>
          <Button size="lg" className="btn-primary w-full mt-6" disabled={submitting}>
            {submitting ? "Жіберілуде..." : "Тапсырысты растау"}
          </Button>
        </div>
      </form>
    </div>
  );
}
