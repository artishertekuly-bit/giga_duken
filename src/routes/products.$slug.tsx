import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { kzt } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingCart, Star, Check, Minus, Plus, ChevronRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { toast } from "sonner";
import { getProductImage } from "@/lib/categoryImage";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/products/$slug")({
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="container mx-auto p-12 text-center">
      <h1 className="font-display text-3xl font-bold">Өнім табылмады</h1>
      <Link to="/products"><Button className="mt-6">Каталогқа оралу</Button></Link>
    </div>
  ),
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWish = useWishlistStore((s) => s.toggle);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(slug, name_kz)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: related } = useQuery({
    queryKey: ["related", product?.category_id],
    enabled: !!product?.category_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, categories(slug)")
        .eq("category_id", product!.category_id)
        .neq("id", product!.id)
        .limit(4);
      return data ?? [];
    },
  });

  if (isLoading) return <div className="container mx-auto p-12">Жүктелуде...</div>;
  if (!product) throw notFound();

  const inWish = useWishlistStore.getState().has(product.id);
  const catSlug = product.categories?.slug ?? "cpu";
  const img = getProductImage(product, catSlug);
  const price = product.discount_price ?? product.price;
  const specs = (product.specs ?? {}) as Record<string, unknown>;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-xs text-muted-foreground flex items-center gap-1 mb-6">
        <Link to="/">Басты</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/products">Өнімдер</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/products" search={{ cat: catSlug }}>{product.categories?.name_kz}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name_kz}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="glass rounded-2xl p-6">
          <div className="aspect-square rounded-xl overflow-hidden bg-black/40">
            <img src={img} alt={product.name_kz} className="w-full h-full object-cover" />
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-accent">{product.brand}</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">{product.name_kz}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-foreground font-medium">{product.rating}</span>
            <span>•</span>
            <span>{product.review_count} пікір</span>
          </div>

          <div className="mt-6 flex items-end gap-3">
            {product.discount_price ? (
              <>
                <div className="font-display font-bold text-3xl text-accent">{kzt(product.discount_price)}</div>
                <div className="text-muted-foreground line-through">{kzt(product.price)}</div>
              </>
            ) : (
              <div className="font-display font-bold text-3xl">{kzt(product.price)}</div>
            )}
          </div>
          <div className={`mt-2 text-sm flex items-center gap-2 ${product.stock > 0 ? "text-success" : "text-destructive"}`}>
            <Check className="h-4 w-4" />
            {product.stock > 0 ? `Қоймада бар (${product.stock} дана)` : "Қоймада жоқ"}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-1 border border-border rounded-lg">
              <button className="p-2" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button className="p-2" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="btn-primary flex-1"
              onClick={() => {
                addItem({ id: product.id, name_kz: product.name_kz, slug: product.slug, price, image_url: img }, qty);
                toast.success("Себетке қосылды ✅");
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" /> Себетке салу
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => { toggleWish(product.id); toast.success(inWish ? "Алынды" : "Тілектер тізіміне қосылды ❤️"); }}
            >
              <Heart className="h-4 w-4 mr-2" /> Тілектерге
            </Button>
          </div>

          <Link to="/compatibility" className="inline-block mt-4 text-sm text-accent hover:underline">
            → Сәйкестікті тексер
          </Link>
        </div>
      </div>

      <div className="mt-16">
        <Tabs defaultValue="desc">
          <TabsList>
            <TabsTrigger value="desc">Сипаттама</TabsTrigger>
            <TabsTrigger value="specs">Сипаттамалар</TabsTrigger>
            <TabsTrigger value="reviews">Пікірлер</TabsTrigger>
          </TabsList>
          <TabsContent value="desc" className="glass rounded-xl p-6 mt-4">
            <p className="text-muted-foreground leading-relaxed">
              {product.description_kz ?? "Сипаттама жоқ."}
            </p>
          </TabsContent>
          <TabsContent value="specs" className="glass rounded-xl p-6 mt-4">
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {Object.entries(specs).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border/50 py-2">
                  <dt className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</dt>
                  <dd className="font-medium">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>
          <TabsContent value="reviews" className="glass rounded-xl p-6 mt-4">
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <div className="font-display text-5xl font-bold">{product.rating}</div>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(product.rating))? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{product.review_count} пікір</div>
              </div>
              <p className="text-sm text-muted-foreground">Шынайы сатып алушылардың пікірлері жүйеге келіп түседі.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {related && related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold mb-6">Ұқсас өнімдер</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
