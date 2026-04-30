import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Статус жаңартылды");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e) => {
      toast.error("Қате шықты: " + e.message);
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Тапсырыстар</h1>
      <div className="glass rounded-xl overflow-hidden border border-border/50 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Қолданушы</th>
              <th className="px-4 py-3 font-medium">Сома</th>
              <th className="px-4 py-3 font-medium">Мекенжай</th>
              <th className="px-4 py-3 font-medium">Күні</th>
              <th className="px-4 py-3 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-4"><Skeleton className="h-20 w-full" /></td>
              </tr>
            ) : orders?.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Тапсырыстар жоқ
                </td>
              </tr>
            ) : (
              orders?.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/20 transition">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground" title={o.id}>
                    {o.id.substring(0, 8)}...
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.full_name || "Белгісіз"}</div>
                    <div className="text-xs text-muted-foreground">{o.phone}</div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {o.total_price?.toLocaleString("ru-RU")} ₸
                  </td>
                  <td className="px-4 py-3">
                    <div>{o.city}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1" title={o.delivery_address}>
                      {o.delivery_address}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="bg-card border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:border-primary"
                      value={o.status}
                      onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value })}
                      disabled={updateStatus.isPending}
                    >
                      <option value="pending">Күтілуде</option>
                      <option value="processing">Дайындалуда</option>
                      <option value="shipped">Жіберілді</option>
                      <option value="delivered">Жеткізілді</option>
                      <option value="cancelled">Болдырмады</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
