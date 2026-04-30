import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

type Search = { q?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({ meta: [{ title: "Іздеу — Giga." }] }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data, isLoading } = useQuery({
    queryKey: ["search", q],
    enabled: !!q,
    queryFn: async () => (await supabase.from("products").select("*, categories(slug)").ilike("name_kz", `%${q}%`)).data ?? [],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-bold">
        «{q ?? ""}» бойынша іздеу нәтижелері
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        {isLoading ? "Іздеу..." : `${data?.length ?? 0} нәтиже`}
      </p>
      {!isLoading && (data?.length ?? 0) === 0 ? (
        <div className="glass rounded-xl p-12 text-center mt-8">
          <p className="text-muted-foreground">Ештеңе табылмады</p>
          <Link to="/products"><Button className="btn-primary mt-4">Каталогты қарау</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {data?.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
