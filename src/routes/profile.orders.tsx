import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { kzt } from "@/lib/format";

export const Route = createFileRoute("/profile/orders")({
  component: OrdersPage,
});

const statusLabel: Record<string, string> = {
  pending: "Күтілуде", confirmed: "Расталды", shipped: "Жолда", delivered: "Жеткізілді",
};

function OrdersPage() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  if (isLoading) return <div>Жүктелуде...</div>;
  if (!orders?.length) return <div className="glass rounded-xl p-8 text-center text-muted-foreground">Әзірше тапсырыс жоқ</div>;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">Тапсырыстарым</h2>
      {orders.map((o) => (
        <div key={o.id} className="glass rounded-xl p-5 flex justify-between items-center gap-4">
          <div>
            <div className="font-mono text-sm text-muted-foreground">#{o.id.slice(0, 8)}</div>
            <div className="font-display font-bold text-lg mt-1">{kzt(o.total_price)}</div>
            <div className="text-xs text-muted-foreground mt-1">{new Date(o.created_at).toLocaleDateString("kk-KZ")}</div>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs">{statusLabel[o.status] ?? o.status}</span>
        </div>
      ))}
    </div>
  );
}
