import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBuilderStore, SLOT_ORDER, SLOT_LABELS_KZ, BUDGET_SPLIT, type PartSlot, type BuilderProduct } from "@/stores/builderStore";
import { checkCompatibility, overallOk } from "@/lib/compatibility";
import { kzt } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, Trash2 } from "lucide-react";
import { getProductImage } from "@/lib/categoryImage";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";

export const Route = createFileRoute("/builder")({
  head: () => ({ meta: [{ title: "PC Жинақтаушы — Giga." }] }),
  component: BuilderPage,
});

const slotToCategorySlug: Record<PartSlot, string> = {
  cpu: "cpu", motherboard: "motherboard", ram: "ram", gpu: "gpu",
  storage: "storage", cooling: "cooling", psu: "psu", case: "case",
};

function BuilderPage() {
  const { selected, setPart, clear, budget, setBudget, autoMode, setAutoMode, total } = useBuilderStore();
  const addToCart = useCartStore((s) => s.addItem);

  const { data: allProducts } = useQuery({
    queryKey: ["builder-products"],
    queryFn: async () => (await supabase.from("products").select("*, categories(slug)")).data ?? [],
  });

  const byCat = useMemo(() => {
    const map: Record<string, BuilderProduct[]> = {};
    allProducts?.forEach((p) => {
      const cs = p.categories?.slug ?? "";
      if (!map[cs]) map[cs] = [];
      map[cs].push({
        id: p.id,
        name_kz: p.name_kz,
        slug: p.slug,
        price: p.discount_price ?? p.price,
        image_url: getProductImage(p, cs),
        specs: (p.specs ?? {}) as Record<string, unknown>,
        category_slug: cs,
        brand: p.brand,
      });
    });
    return map;
  }, [allProducts]);

  const selectedWithLatest = useMemo(() => {
    if (!allProducts) return selected;

    const latestById = new Map(
      allProducts.map((p) => [
        p.id,
        {
          id: p.id,
          name_kz: p.name_kz,
          slug: p.slug,
          price: p.discount_price ?? p.price,
          image_url: getProductImage(p, p.categories?.slug ?? ""),
          specs: (p.specs ?? {}) as Record<string, unknown>,
          category_slug: p.categories?.slug ?? "",
          brand: p.brand,
        },
      ])
    );

    return Object.fromEntries(
      Object.entries(selected).map(([slot, item]) => [
        slot,
        item && latestById.has(item.id) ? latestById.get(item.id) : item,
      ])
    ) as Partial<Record<PartSlot, BuilderProduct>>;
  }, [allProducts, selected]);

  const issues = checkCompatibility(selectedWithLatest);
  const compatOk = overallOk(issues);
  const totalPrice = Object.values(selectedWithLatest).reduce((sum, p) => sum + (p?.price ?? 0), 0);

  const autoBuild = () => {
    SLOT_ORDER.forEach((slot) => {
      const budgetSlice = budget * BUDGET_SPLIT[slot];
      const pool = byCat[slotToCategorySlug[slot]] ?? [];
      // pick most expensive under budgetSlice, else cheapest
      const fit = [...pool].filter((p) => p.price <= budgetSlice).sort((a, b) => b.price - a.price)[0]
        ?? [...pool].sort((a, b) => a.price - b.price)[0];
      if (fit) setPart(slot, fit);
    });
    toast.success("Оптималды жинақ ұсынылды ✨");
  };

  const addAllToCart = () => {
    SLOT_ORDER.forEach((slot) => {
      const p = selectedWithLatest[slot];
      if (p) addToCart({ id: p.id, name_kz: p.name_kz, slug: p.slug, price: p.price, image_url: p.image_url });
    });
    toast.success("Барлығы себетке қосылды ✅");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">PC Жинақтаушы</h1>
          <p className="text-sm text-muted-foreground mt-1">Өз арман компьютеріңді жина</p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg glass">
          <button onClick={() => setAutoMode(false)} className={`px-3 py-1.5 rounded-md text-sm ${!autoMode ? "bg-primary text-primary-foreground" : ""}`}>Қолмен</button>
          <button onClick={() => setAutoMode(true)} className={`px-3 py-1.5 rounded-md text-sm ${autoMode ? "bg-primary text-primary-foreground" : ""}`}>Авто</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          {autoMode && (
            <div className="glass rounded-xl p-5">
              <label className="text-sm font-medium">Бюджет: <span className="text-accent font-bold">{kzt(budget)}</span></label>
              <input type="range" min={200000} max={2000000} step={50000} value={budget}
                onChange={(e) => setBudget(Number(e.target.value))} className="w-full accent-primary mt-2" />
              <Button className="btn-primary mt-4" onClick={autoBuild}>
                <Sparkles className="h-4 w-4 mr-2" /> Оптималды жинақты ұсын
              </Button>
            </div>
          )}

          {SLOT_ORDER.map((slot) => {
            const cur = selectedWithLatest[slot];
            const pool = byCat[slotToCategorySlug[slot]] ?? [];
            return (
              <div key={slot} className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {cur && <Check className="h-4 w-4 text-success" />}
                    <h3 className="font-display font-bold">{SLOT_LABELS_KZ[slot]}</h3>
                  </div>
                  {cur && <button onClick={() => setPart(slot, null)} className="text-xs text-muted-foreground hover:text-destructive">Өшіру</button>}
                </div>
                {cur ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                    {cur.image_url && <img src={cur.image_url} alt="" className="w-14 h-14 rounded-md object-cover" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium line-clamp-1">{cur.name_kz}</div>
                      <div className="text-sm text-accent font-bold">{kzt(cur.price)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2 max-h-64 overflow-auto">
                    {pool.slice(0, 8).map((p) => (
                      <button key={p.id} onClick={() => setPart(slot, p)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary text-left">
                        {p.image_url && <img src={p.image_url} alt="" className="w-10 h-10 rounded-md object-cover" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm line-clamp-1">{p.name_kz}</div>
                        </div>
                        <div className="text-sm font-medium">{kzt(p.price)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <aside className="glass rounded-xl p-5 h-max sticky top-20">
          <h2 className="font-display font-bold text-lg">Жинақ қорытындысы</h2>
          <div className="mt-4 space-y-2">
            {SLOT_ORDER.map((slot) => (
              <div key={slot} className="flex justify-between text-sm gap-2">
                <span className="text-muted-foreground">{SLOT_LABELS_KZ[slot]}</span>
                <span className={selectedWithLatest[slot] ? "" : "text-muted-foreground"}>
                  {selectedWithLatest[slot] ? kzt(selectedWithLatest[slot]!.price) : "——"}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border/50 pt-3 mt-4 flex justify-between font-display font-bold text-lg">
            <span>Барлығы</span>
            <span className="text-accent">{kzt(Object.values(selectedWithLatest).reduce((sum, p) => sum + (p?.price ?? 0), 0))}</span>
          </div>

          <div className="mt-5 space-y-2">
            {issues.map((i, idx) => (
              <div key={idx} className={`text-xs flex gap-2 p-2 rounded-md ${i.severity === "ok" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {i.severity === "ok" ? <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" /> : <X className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                <span>{i.message}</span>
              </div>
            ))}
            {issues.length === 0 && <div className="text-xs text-muted-foreground">Компоненттерді таңдаңыз</div>}
          </div>

          <div className="mt-5 space-y-2">
            <Button className="btn-primary w-full" disabled={totalPrice === 0 || !compatOk} onClick={addAllToCart}>
              Барлығын себетке салу
            </Button>
            <Button variant="outline" className="w-full" onClick={clear}>
              <Trash2 className="h-4 w-4 mr-2" /> Тазарту
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
