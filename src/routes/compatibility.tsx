import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { checkCompatibility, overallOk } from "@/lib/compatibility";
import type { BuilderProduct, PartSlot } from "@/stores/builderStore";
import { SLOT_LABELS_KZ } from "@/stores/builderStore";
import { Check, X } from "lucide-react";
import { getProductImage } from "@/lib/categoryImage";

export const Route = createFileRoute("/compatibility")({
  head: () => ({ meta: [{ title: "Сәйкестік тексеруші — Giga." }] }),
  component: CompatPage,
});

const SLOTS: PartSlot[] = ["cpu", "motherboard", "ram", "gpu", "cooling", "psu", "case"];

function CompatPage() {
  const [selected, setSelected] = useState<Partial<Record<PartSlot, BuilderProduct>>>({});
  const [picks, setPicks] = useState<Array<{ slot: PartSlot | ""; productId: string }>>([
    { slot: "", productId: "" }, { slot: "", productId: "" }, { slot: "", productId: "" },
  ]);
  const [results, setResults] = useState<ReturnType<typeof checkCompatibility> | null>(null);

  const { data: products } = useQuery({
    queryKey: ["compat-products"],
    queryFn: async () => (await supabase.from("products").select("*, categories(slug)")).data ?? [],
  });

  const bySlot = useMemo(() => {
    const map: Record<string, BuilderProduct[]> = {};
    products?.forEach((p) => {
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
  }, [products]);

  const run = () => {
    const sel: Partial<Record<PartSlot, BuilderProduct>> = {};
    picks.forEach((p) => {
      if (p.slot && p.productId) {
        const item = bySlot[p.slot]?.find((x) => x.id === p.productId);
        if (item) sel[p.slot] = item;
      }
    });
    setSelected(sel);
    setResults(checkCompatibility(sel));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-display text-3xl md:text-4xl font-bold">Сәйкестік тексеруші</h1>
      <p className="text-muted-foreground mt-2">Компоненттер бір-бірімен сәйкес пе екенін тексеріңіз</p>

      <div className="glass rounded-xl p-6 mt-8 space-y-4">
        {picks.map((pick, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={pick.slot} onChange={(e) => {
              const ns = [...picks]; ns[idx] = { slot: e.target.value as PartSlot, productId: "" }; setPicks(ns);
            }} className="h-11 rounded-lg bg-card border border-border px-3">
              <option value="">— Компонент түрі —</option>
              {SLOTS.map((s) => <option key={s} value={s}>{SLOT_LABELS_KZ[s]}</option>)}
            </select>
            <select value={pick.productId} disabled={!pick.slot} onChange={(e) => {
              const ns = [...picks]; ns[idx] = { ...ns[idx], productId: e.target.value }; setPicks(ns);
            }} className="h-11 rounded-lg bg-card border border-border px-3 disabled:opacity-50">
              <option value="">— Өнімді таңдау —</option>
              {pick.slot && bySlot[pick.slot]?.map((p) => <option key={p.id} value={p.id}>{p.name_kz}</option>)}
            </select>
          </div>
        ))}
        <Button className="btn-primary w-full sm:w-auto" onClick={run}>Тексеру</Button>
      </div>

      {results && (
        <div className="glass rounded-xl p-6 mt-6">
          <h2 className="font-display text-xl font-bold mb-4">Нәтиже</h2>
          {results.length === 0 ? (
            <p className="text-muted-foreground">Тексеру үшін кем дегенде 2 сәйкес компонент таңдаңыз.</p>
          ) : (
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className={`flex gap-2 p-3 rounded-lg ${r.severity === "ok" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {r.severity === "ok" ? <Check className="h-4 w-4 shrink-0 mt-0.5" /> : <X className="h-4 w-4 shrink-0 mt-0.5" />}
                  <span className="text-sm">{r.message}</span>
                </div>
              ))}
              <div className={`mt-4 p-4 rounded-lg font-display font-bold text-center ${overallOk(results) ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                {overallOk(results) ? "Барлығы сәйкес! ✅" : "Қателер бар ❌"}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
