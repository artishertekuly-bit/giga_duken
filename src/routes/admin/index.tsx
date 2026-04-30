import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShoppingBag, Package, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        { count: usersCount },
        { count: ordersCount, data: orders },
        { count: productsCount }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total_price", { count: "exact" }),
        supabase.from("products").select("*", { count: "exact", head: true }),
      ]);

      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;

      return {
        users: usersCount || 0,
        orders: ordersCount || 0,
        products: productsCount || 0,
        revenue: totalRevenue,
      };
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const statCards = [
    { label: "Қолданушылар", value: stats?.users, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Тапсырыстар", value: stats?.orders, icon: ShoppingBag, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Тауарлар", value: stats?.products, icon: Package, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Жалпы табыс", value: `${stats?.revenue?.toLocaleString("ru-RU")} ₸`, icon: DollarSign, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Басты статистика</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="glass rounded-xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="text-2xl font-bold font-display">{s.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
