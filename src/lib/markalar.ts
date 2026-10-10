// Panelin gördüğü marka biçimi (liste, ekleme ve düzenleme cevaplarında aynı).
import { yuklemeAdresi } from "@/lib/yukleme";
import type { Marka } from "@/generated/prisma/client";

export function markaGorunumu(m: Marka) {
  return {
    id: m.id, ad: m.ad, url: m.url, aktif: m.aktif, sira: m.sira,
    logo: m.logo ? { url: yuklemeAdresi(m.logo)!, genislik: m.logoGenislik, yukseklik: m.logoYukseklik } : null,
  };
}
