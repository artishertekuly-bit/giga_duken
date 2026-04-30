import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/")({
  component: ProfileIndex,
});

function ProfileIndex() {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });
  const [form, setForm] = useState({ full_name: "", phone: "" });

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name ?? "", phone: profile.phone ?? "" });
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
    if (error) toast.error(error.message); else toast.success("Сақталды ✅");
  };

  return (
    <form onSubmit={save} className="glass rounded-xl p-6 space-y-4 max-w-xl">
      <h2 className="font-display text-xl font-bold">Жеке деректер</h2>
      <div>
        <label className="text-sm font-medium block mb-1.5">Email</label>
        <input disabled value={user?.email ?? ""} className="w-full h-11 rounded-lg bg-card/50 border border-border px-3 text-muted-foreground" />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Аты-жөні</label>
        <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="w-full h-11 rounded-lg bg-card border border-border px-3 focus:border-primary focus:outline-none" />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Телефон</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full h-11 rounded-lg bg-card border border-border px-3 focus:border-primary focus:outline-none" />
      </div>
      <Button type="submit" className="btn-primary">Сақтау</Button>
    </form>
  );
}
