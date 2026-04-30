import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { kzt } from "@/lib/format";

export const Route = createFileRoute("/profile/builds")({
  component: BuildsPage,
});

function BuildsPage() {
  const { user } = useAuth();
  const { data: builds } = useQuery({
    queryKey: ["builds", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("builds").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  if (!builds?.length) return <div className="glass rounded-xl p-8 text-center text-muted-foreground">Әзірше жинақтар жоқ</div>;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">Менің жинақтарым</h2>
      {builds.map((b) => (
        <div key={b.id} className="glass rounded-xl p-5 flex justify-between">
          <div>
            <div className="font-semibold">{b.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{new Date(b.created_at).toLocaleDateString("kk-KZ")}</div>
          </div>
          <div className="font-display font-bold text-lg">{kzt(b.total_price ?? 0)}</div>
        </div>
      ))}
    </div>
  );
}
