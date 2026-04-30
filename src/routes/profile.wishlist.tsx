import { createFileRoute, Link } from "@tanstack/react-router";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  const { data } = useQuery({
    queryKey: ["wishlist", ids],
    enabled: ids.length > 0,
    queryFn: async () => (await supabase.from("products").select("*, categories(slug)").in("id", ids)).data ?? [],
  });

  if (ids.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Тілектер тізімі бос</p>
        <Link to="/products"><Button className="btn-primary mt-4">Өнімдерге өту</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-6">Тілектер тізімі</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data?.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
