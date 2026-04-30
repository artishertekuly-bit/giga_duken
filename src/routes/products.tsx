import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { categoryLabel } from "@/lib/format";
import { SlidersHorizontal, X } from "lucide-react";

type Search = { cat?: string; q?: string; sort?: string };

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    cat: typeof s.cat === "string" ? s.cat : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    sort: typeof s.sort === "string" ? s.sort : "new",
  }),
  head: () => ({ meta: [{ title: "Өнімдер — Giga." }, { name: "description", content: "PC компоненттерінің барлық каталогы." }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const { cat, q, sort } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [priceMax, setPriceMax] = useState<number>(700000);
  const [inStock, setInStock] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: cats } = useQuery({
    queryKey: ["cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", cat, sort, q],
    queryFn: async () => {
      let query = supabase.from("products").select("*, categories(slug, name_kz)");
      if (cat) {
        const catRow = (await supabase.from("categories").select("id").eq("slug", cat).maybeSingle()).data;
        if (catRow) query = query.eq("category_id", catRow.id);
      }
      if (q) query = query.ilike("name_kz", `%${q}%`);
      if (sort === "price_asc") query = query.order("price", { ascending: true });
      else if (sort === "price_desc") query = query.order("price", { ascending: false });
      else if (sort === "rating") query = query.order("rating", { ascending: false });
      else query = query.order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const brands = useMemo(() => {
    const set = new Set<string>();
    products?.forEach((p) => set.add(p.brand));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    return (products ?? []).filter((p) => {
      const price = p.discount_price ?? p.price;
      if (price > priceMax) return false;
      if (inStock && p.stock <= 0) return false;
      if (minRating && (p.rating ?? 0) < minRating) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      return true;
    });
  }, [products, priceMax, inStock, minRating, selectedBrands]);

  const setCat = (slug?: string) => navigate({ search: (prev) => ({ ...prev, cat: slug }) });
  const setSort = (s: string) => navigate({ search: (prev) => ({ ...prev, sort: s }) });

  const FiltersPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Категориялар</h3>
        <div className="space-y-1">
          <button onClick={() => setCat(undefined)} className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${!cat ? "bg-primary/20 text-foreground" : "hover:bg-secondary"}`}>
            Барлығы
          </button>
          {cats?.map((c) => (
            <button key={c.id} onClick={() => setCat(c.slug)} className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${cat === c.slug ? "bg-primary/20 text-foreground" : "hover:bg-secondary"}`}>
              {c.name_kz}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Бағасы</h3>
        <input
          type="range"
          min={20000}
          max={700000}
          step={5000}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>₸0</span>
          <span>₸{priceMax.toLocaleString("kk-KZ")}</span>
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Брендтер</h3>
          <div className="space-y-2 max-h-56 overflow-auto">
            {brands.map((b) => (
              <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b)}
                  onChange={(e) =>
                    setSelectedBrands((cur) => e.target.checked ? [...cur, b] : cur.filter((x) => x !== b))
                  }
                  className="accent-primary"
                />
                {b}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Басқа</h3>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-primary" />
          Қоймада бар
        </label>
        <div className="mt-3">
          <label className="text-sm">Мин. рейтинг: {minRating}</label>
          <input type="range" min={0} max={5} step={0.5} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full accent-primary" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            {cat ? categoryLabel[cat] ?? "Өнімдер" : "Барлық өнімдер"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Жүктелуде..." : `${filtered.length} өнім табылды`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileFiltersOpen(true)} className="lg:hidden p-2 rounded-lg border border-border">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-lg bg-card border border-border px-3 text-sm"
          >
            <option value="new">Жаңалар</option>
            <option value="price_asc">Бағасы (өсу)</option>
            <option value="price_desc">Бағасы (кему)</option>
            <option value="rating">Рейтинг бойынша</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="hidden lg:block glass rounded-xl p-5 h-max sticky top-20">{FiltersPanel}</aside>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl lg:hidden overflow-auto p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">Фильтрлер</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2"><X className="h-5 w-5" /></button>
            </div>
            {FiltersPanel}
            <Button className="w-full mt-6 btn-primary" onClick={() => setMobileFiltersOpen(false)}>Қолдану</Button>
          </div>
        )}

        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <h3 className="font-display text-xl font-bold">Өнім табылмады</h3>
              <p className="text-muted-foreground text-sm mt-2">Фильтрлерді өзгертіп көріңіз.</p>
              <Link to="/products"><Button variant="outline" className="mt-4">Барлық өнімдер</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
