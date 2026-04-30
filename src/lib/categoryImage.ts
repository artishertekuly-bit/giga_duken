import cpu from "@/assets/cat-cpu.jpg";
import gpu from "@/assets/cat-gpu.jpg";
import ram from "@/assets/cat-ram.jpg";
import motherboard from "@/assets/cat-motherboard.jpg";
import storage from "@/assets/cat-storage.jpg";
import psu from "@/assets/cat-psu.jpg";
import pcCase from "@/assets/cat-case.jpg";
import cooling from "@/assets/cat-cooling.jpg";
import intel from "@/assets/intel.svg";
import amd from "@/assets/amd.svg";

export const categoryImage: Record<string, string> = {
  cpu, gpu, ram, motherboard, storage, psu, case: pcCase, cooling,
};

export function getProductImage(
  product: { image_url: string | null; brand?: string | null; categories?: { slug: string } | null },
  categorySlug?: string
) {
  const slug = categorySlug ?? product.categories?.slug ?? "cpu";
  const hasImage = !!product.image_url;

  if (!hasImage && slug === "cpu") {
    const brand = product.brand?.toLowerCase() ?? "";
    if (brand.includes("intel")) return intel;
    if (brand.includes("amd")) return amd;
  }

  return product.image_url ?? categoryImage[slug] ?? categoryImage["cpu"];
}
