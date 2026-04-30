import { Link } from "@tanstack/react-router";
import { Instagram, Send, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="giga-logo text-2xl">
            Giga<span className="dot">.</span>
          </Link>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            Қазақстанның ең үздік техника дүкені
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" className="p-2 rounded-lg bg-white/5 hover:text-primary"><Instagram className="h-4 w-4" /></a>
            <a href="#" className="p-2 rounded-lg bg-white/5 hover:text-primary"><Send className="h-4 w-4" /></a>
            <a href="#" className="p-2 rounded-lg bg-white/5 hover:text-primary"><MessageCircle className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Категориялар</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" search={{ cat: "cpu" }}>Процессорлар</Link></li>
            <li><Link to="/products" search={{ cat: "gpu" }}>Видеокарталар</Link></li>
            <li><Link to="/products" search={{ cat: "ram" }}>Жедел жад</Link></li>
            <li><Link to="/products" search={{ cat: "motherboard" }}>Материнскалар</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Компания</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#">Біз туралы</a></li>
            <li><a href="#">Байланыс</a></li>
            <li><a href="#">Жеткізу шарттары</a></li>
            <li><a href="#">Қайтару</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Қолдау</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>+7 (700) 123-45-67</li>
            <li>hello@giga.kz</li>
            <li>Шымкент, Қазақстан</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © 2026 Giga. Барлық құқықтар қорғалған.
      </div>
    </footer>
  );
}
