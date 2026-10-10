// Panel tarafı proje işlemleri: formdan gelen veriyi kayda çevirme (adres üretimi,
// video bağlantısı ayrıştırma) ve panelin gördüğü biçim. Vitrin tarafı lib/vitrin.ts.
import { prisma } from "@/lib/prisma";
import { KuralHatasi } from "@/lib/http";
import { slugUret } from "@/lib/slug";
import { videoAdresiCoz, videoBilgisi } from "@/lib/video";
import { yuklemeAdresi } from "@/lib/yukleme";
import { kategoriAdi } from "@/lib/kategoriler";
import type { Proje, Foto } from "@/generated/prisma/client";

/** Video bağlantısı → kayıt alanları. undefined: dokunma, null/"": videoyu kaldır. */
export function videoAlanlari(adres: string | null | undefined) {
  if (adres === undefined) return {};
  if (!adres) return { videoSaglayici: null, videoKimlik: null };
  const v = videoAdresiCoz(adres);
  if (!v) throw new KuralHatasi(400, "Video bağlantısı tanınmadı. YouTube ya da Vimeo video adresini yapıştırın.");
  return { videoSaglayici: v.saglayici, videoKimlik: v.kimlik };
}

/**
 * Proje adresi. Kullanıcı yazdıysa aynen kullanılır, çakışırsa 409 (sessizce
 * "-2" eklemek, kullanıcının paylaştığı adresi bozardı). Boşsa başlıktan üretilir;
 * üretilen çakışırsa "-2", "-3"… eklenir.
 */
export async function slugBelirle(istenen: string | null | undefined, baslik: string, haricId?: number): Promise<string> {
  const dolu = async (s: string) =>
    !!(await prisma.proje.findFirst({ where: { slug: s, ...(haricId ? { NOT: { id: haricId } } : {}) }, select: { id: true } }));
  if (istenen) {
    if (await dolu(istenen)) throw new KuralHatasi(409, "Bu adres başka bir projede kullanılıyor");
    return istenen;
  }
  const kok = slugUret(baslik) || "proje";
  for (let i = 1; i < 1000; i++) {
    const aday = i === 1 ? kok : `${kok}-${i}`;
    if (!(await dolu(aday))) return aday;
  }
  throw new KuralHatasi(409, "Bu başlıkla adres üretilemedi, adresi elle yazın");
}

export function fotoGorunumu(f: Foto) {
  return {
    id: f.id, projeId: f.projeId, url: yuklemeAdresi(f.dosya)!, genislik: f.genislik, yukseklik: f.yukseklik,
    aciklama: f.aciklama, galeride: f.galeride, sira: f.sira,
  };
}

export function projeGorunumu(p: Proje & { fotolar?: Foto[]; _count?: { fotolar: number } }) {
  const video = videoBilgisi(p.videoSaglayici, p.videoKimlik);
  return {
    id: p.id, slug: p.slug, adres: `/projeler/${p.slug}`, baslik: p.baslik,
    kategori: p.kategori, kategoriAdi: kategoriAdi(p.kategori),
    musteri: p.musteri, yil: p.yil, ozet: p.ozet, aciklama: p.aciklama,
    kapak: p.kapak ? { url: yuklemeAdresi(p.kapak)!, genislik: p.kapakGenislik, yukseklik: p.kapakYukseklik } : null,
    /** Formda düzenlenebilsin diye izleme adresi; kayıtta yine ayrıştırılır */
    videoAdresi: video?.izlemeAdresi ?? null,
    video,
    oneCikan: p.oneCikan, yayinda: p.yayinda, sira: p.sira,
    fotoSayisi: p._count?.fotolar ?? p.fotolar?.length ?? 0,
    fotolar: p.fotolar?.map(fotoGorunumu),
    olusturma: p.olusturma.toISOString(), guncelleme: p.guncelleme.toISOString(),
  };
}
