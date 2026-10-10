// /sitemap.xml — sabit sayfalar + yayındaki her proje. Taslak proje listelenmez.
// Her istekte veritabanından okunur: yeni proje yayına alınınca harita kendiliğinden güncellenir.
import type { MetadataRoute } from "next";
import { siteAdresi } from "@/lib/seo";
import { siteHaritasiProjeleri } from "@/lib/vitrin";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = siteAdresi();
  const sabit = ["", "/hakkimizda", "/hizmetler", "/projeler", "/galeri", "/iletisim", "/teklif-al"];
  const projeler = await siteHaritasiProjeleri();
  return [
    ...sabit.map((yol) => ({ url: `${site}${yol || "/"}`, changeFrequency: "weekly" as const, priority: yol ? 0.7 : 1 })),
    ...projeler.map((p) => ({
      url: `${site}/projeler/${p.slug}`, lastModified: p.guncelleme, changeFrequency: "monthly" as const, priority: 0.6,
    })),
  ];
}
