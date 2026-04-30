import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Cpu, Monitor, MemoryStick, CircuitBoard, HardDrive, Zap, Box, Wind, Sparkles, ShieldCheck, Truck, RotateCcw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/Skeleton";
import { categoryImage } from "@/lib/categoryImage";
import heroImg from "@/assets/hero-main.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Giga. — Қазақстанның ең үздік техника дүкені" },
      { name: "description", content: "Процессор, видеокарта және барлық PC компоненттері. PC Жинақтаушы, сәйкестік тексеру, жылдам жеткізу." },
    ],
  }),
  component: HomePage,
});

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  cpu: Cpu, monitor: Monitor, "memory-stick": MemoryStick,
  "circuit-board": CircuitBoard, "hard-drive": HardDrive, zap: Zap, box: Box, wind: Wind,
};

function HomePage() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*, products(count)").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: featured, isLoading: featLoading } = useQuery({
    queryKey: ["featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(slug)")
        .eq("is_featured", true)
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const { data: newest } = useQuery({
    queryKey: ["newest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(slug)")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        {/* floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-accent/70 animate-float-slow"
            style={{
              left: `${(i * 83) % 100}%`,
              top: `${(i * 37) % 80 + 10}%`,
              animationDelay: `${i * 0.4}s`,
              boxShadow: "0 0 12px 2px rgba(0,212,255,0.6)",
            }}
          />
        ))}
        <div className="container mx-auto px-4 relative py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3 text-accent" /> Giga. — Жаңа буынды техника дүкені
          </div>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Қазақстанның ең үздік<br />
            <span className="text-gradient">техника дүкені</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Процессор, видеокарта және барлық PC компоненттері. Арман компьютеріңді бүгін жина.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/builder">
              <Button size="lg" className="btn-primary text-base px-7">
                PC Жинақтаушы <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline" className="text-base px-7">
                Өнімдерді қарау
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="glass rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50 overflow-hidden">
          {[
            { v: "500+", l: "өнім" },
            { v: "1000+", l: "тапсырыс" },
            { v: "4.9 ⭐", l: "рейтинг" },
            { v: "Тегін", l: "жеткізу" },
          ].map((s) => (
            <div key={s.l} className="p-5 text-center">
              <div className="font-display font-bold text-xl md:text-2xl">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 mt-20">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">Категориялар</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(categories ?? Array(8).fill(null)).map((c, i) => {
            if (!c) return <Skeleton key={i} className="aspect-square rounded-xl" />;
            const Icon = iconMap[c.icon] ?? Cpu;
            const count = Array.isArray(c.products) ? c.products[0]?.count ?? 0 : 0;
            return (
              <Link
                key={c.id}
                to="/products"
                search={{ cat: c.slug }}
                className="group glass rounded-xl p-5 glow-hover relative overflow-hidden"
              >
                <img src={categoryImage[c.slug]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mt-4 font-semibold">{c.name_kz}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{count} өнім</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 mt-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Үздік өнімдер</h2>
          <Link to="/products" className="text-sm text-accent hover:underline">Барлығын көру →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)
            : featured?.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Builder CTA */}
      <section className="container mx-auto px-4 mt-20">
        <div className="relative overflow-hidden rounded-2xl glass p-8 md:p-12">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs tracking-widest text-accent uppercase">Giga. PC Builder</div>
              <h3 className="font-display text-2xl md:text-4xl font-bold mt-2">
                PC Жинақтаушы — бюджетіңізге<br />сай жинақ
              </h3>
              <p className="text-muted-foreground mt-3 max-w-lg">
                Сәйкестік автоматты тексеріледі. Қолмен немесе бюджет бойынша авто-жинақ.
              </p>
            </div>
            <Link to="/builder">
              <Button size="lg" className="btn-primary text-base px-7">
                Жинауды бастау <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Compatibility CTA */}
      <section className="container mx-auto px-4 mt-8">
        <Link to="/compatibility" className="block glass rounded-2xl p-6 glow-hover">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl md:text-2xl font-bold">Компоненттерің сәйкес пе?</h3>
              <p className="text-sm text-muted-foreground mt-1">Тегін онлайн сәйкестік тексеруші.</p>
            </div>
            <ArrowRight className="h-6 w-6 text-accent shrink-0" />
          </div>
        </Link>
      </section>

      {/* New arrivals */}
      <section className="container mx-auto px-4 mt-20">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">Жаңа түскендер</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(newest ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Trust */}
      <section className="container mx-auto px-4 mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { i: ShieldCheck, t: "Ресми кепілдік" },
            { i: Truck, t: "Жылдам жеткізу" },
            { i: RotateCcw, t: "Оңай қайтару" },
            { i: Lock, t: "Қауіпсіз төлем" },
          ].map((b) => (
            <div key={b.t} className="glass rounded-xl p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <b.i className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm font-medium">{b.t}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
