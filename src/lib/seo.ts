// Arama motoru ve paylaşım bilgileri — hepsi panelden girilen ayarlardan türetilir;
// burada elle yazılmış firma bilgisi yok.
import type { Vitrin } from "@/lib/vitrin";
import { telefonUluslararasi } from "@/lib/telefon";

export function siteAdresi(): string {
  return (process.env.SITE_URL || "").replace(/\/$/, "");
}

/** Aramada görünen başlık. Panelde yazılmışsa o; yoksa "Firma · Video Prodüksiyon ve Canlı Yayın". */
export function aramaBasligi(v: Vitrin): string {
  return v.seo.baslik || `${v.firma.ad} · Video Prodüksiyon, Canlı Yayın ve Drone Çekimi`;
}

export function aramaAciklamasi(v: Vitrin): string {
  if (v.seo.aciklama) return v.seo.aciklama;
  const metin = `${v.firma.slogan} ${v.firma.altSlogan}`.replace(/\s+/g, " ").trim();
  return metin.length > 165 ? `${metin.slice(0, 162).replace(/\s+\S*$/, "")}…` : metin;
}

/** schema.org — Google'ın firma adını, iletişim bilgisini ve sosyal hesapları tanıması için. */
export function firmaVerisi(v: Vitrin) {
  const site = siteAdresi();
  const sosyal = Object.values(v.sosyal).filter((s): s is string => !!s);
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${site}/#firma`,
    name: v.firma.ad,
    slogan: v.firma.slogan || undefined,
    description: aramaAciklamasi(v),
    url: site || undefined,
    logo: v.firma.logo ? `${site}${v.firma.logo.url}` : undefined,
    image: v.medya.paylasimGorseli ? `${site}${v.medya.paylasimGorseli.url}` : undefined,
    telephone: v.iletisim.telefon ? `+${telefonUluslararasi(v.iletisim.telefon)}` : undefined,
    email: v.iletisim.eposta || undefined,
    address: v.iletisim.adres ? { "@type": "PostalAddress", streetAddress: v.iletisim.adres, addressCountry: "TR" } : undefined,
    hasMap: v.iletisim.haritaLink || undefined,
    sameAs: sosyal.length ? sosyal : undefined,
    makesOffer: v.hizmetler.map((h) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: h.baslik, description: h.ozet },
    })),
  };
}

/** JSON-LD'yi <script> içine güvenle yazmak için: metindeki "</script>" etiketi kapatmasın. */
export function jsonLd(veri: unknown): string {
  return JSON.stringify(veri).replace(/</g, "\\u003c");
}
