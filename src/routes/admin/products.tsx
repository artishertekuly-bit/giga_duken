import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name_kz)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Тауар өшірілді");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e) => toast.error("Қате: " + e.message),
  });

  const addMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const name = formData.get("name_kz") as string;
      const price = parseInt(formData.get("price") as string, 10);
      const category_id = formData.get("category_id") as string;
      const brand = formData.get("brand") as string;
      const model = formData.get("model") as string;
      
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.floor(Math.random() * 1000);

      const { error } = await supabase.from("products").insert({
        name_kz: name,
        slug,
        price,
        category_id,
        brand,
        model,
        stock: 10,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Тауар қосылды");
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e) => toast.error("Қате: " + e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Тауарлар</h1>
        <Button onClick={() => setShowAddForm(true)} className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> Тауар қосу
        </Button>
      </div>

      {showAddForm && (
        <div className="glass rounded-xl p-6 mb-8 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Жаңа тауар</h2>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-secondary rounded">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addMutation.mutate(new FormData(e.currentTarget));
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Атауы</label>
              <input required name="name_kz" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Категория</label>
              <select required name="category_id" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none">
                <option value="">Таңдаңыз...</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_kz}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Бренд</label>
              <input required name="brand" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Модель</label>
              <input required name="model" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Бағасы (₸)</label>
              <input required type="number" name="price" min="0" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Бас тарту</Button>
              <Button type="submit" className="btn-primary" disabled={addMutation.isPending}>Сақтау</Button>
            </div>
          </form>
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden border border-border/50 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Категория</th>
              <th className="px-4 py-3 font-medium">Атауы</th>
              <th className="px-4 py-3 font-medium">Бағасы</th>
              <th className="px-4 py-3 font-medium text-right">Әрекет</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-4"><Skeleton className="h-20 w-full" /></td>
              </tr>
            ) : products?.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  Тауарлар табылмады
                </td>
              </tr>
            ) : (
              products?.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/20 transition">
                  <td className="px-4 py-3 text-muted-foreground">{(p.categories as any)?.name_kz}</td>
                  <td className="px-4 py-3 font-medium">{p.name_kz}</td>
                  <td className="px-4 py-3">{p.price?.toLocaleString("ru-RU")} ₸</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm("Бұл тауарды өшіретініңізге сенімдісіз бе?")) {
                          deleteMutation.mutate(p.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition"
                      title="Өшіру"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
