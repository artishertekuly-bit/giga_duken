import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { kzt } from "@/lib/format";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { toast } from "sonner";
import { getProductImage } from "@/lib/categoryImage";

type Product = Tables<"products"> & { categories?: { slug: string } | null };

export function ProductCard({ product, categorySlug }: { product: Product; categorySlug?: string }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const inWish = useWishlistStore((s) => s.has(product.id));
  const img = getProductImage(product, categorySlug);
  const price = product.discount_price ?? product.price;

  return (
    <div className="group glass rounded-xl overflow-hidden glow-hover flex flex-col">
      <Link to="/products/$slug" params={{ slug: product.slug }} className="relative aspect-square overflow-hidden block bg-black/40">
        <img
          src={img}
          alt={product.name_kz}
          loading="lazy"
          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-card/85 text-card-foreground backdrop-blur border border-border">
          {product.brand}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWish(product.id);
            toast.success(inWish ? "Тілектер тізімінен алынды" : "Тілектер тізіміне қосылды ❤️");
          }}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur border border-border transition ${
            inWish ? "bg-primary text-primary-foreground" : "bg-card/85 text-foreground hover:bg-primary hover:text-primary-foreground"
          }`}
          aria-label="Тілектер"
        >
          <Heart className={`h-4 w-4 ${inWish ? "fill-current" : ""}`} />
        </button>
      </Link>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link to="/products/$slug" params={{ slug: product.slug }} className="font-medium line-clamp-2 hover:text-primary transition">
          {product.name_kz}
        </Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span>{product.rating}</span>
          <span>•</span>
          <span>{product.review_count} пікір</span>
        </div>
        <div className="flex items-end justify-between mt-auto gap-2">
          <div>
            {product.discount_price ? (
              <>
                <div className="text-xs text-muted-foreground line-through">{kzt(product.price)}</div>
                <div className="font-display font-bold text-lg text-accent">{kzt(product.discount_price)}</div>
              </>
            ) : (
              <div className="font-display font-bold text-lg">{kzt(product.price)}</div>
            )}
          </div>
          <button
            onClick={() => {
              addItem({
                id: product.id,
                name_kz: product.name_kz,
                slug: product.slug,
                price,
                image_url: img,
              });
              toast.success("Себетке қосылды ✅");
            }}
            className="p-2.5 rounded-lg btn-primary shrink-0"
            aria-label="Себетке салу"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
