// Herkese açık sitenin okuduğu veri — sayfalar (sunucu bileşenleri) buradan okur,
// veritabanına doğrudan gitmez. Taslak proje, pasif hizmet/marka ve taslak projenin
// fotoğrafı bu dosyanın süzgecinden geçmeden sayfaya ulaşamaz: süzgeç tek yerde
// (rehber §7.25 — aynı kaydın durumuna iki farklı süzgeç uygulanınca ekranlar ayrıştı).
//
// Her okuma `connection()` ile başlar: veri panelden değişir, sayfa derleme anında
// donmamalı. Bu satır olmadan Next ana sayfayı build sırasında bir kez üretip
// (`x-nextjs-prerender`, `s-maxage=31536000`) panelde yapılan hiçbir değişikliği
// göstermiyordu — dev'de görünmez, yalnız üretim derlemesinde (prova, 2026-10-09).
// Süzgeç gibi bu da tek yerde: bu dosyadan okuyan her sayfa kendiliğinden dinamik olur.
import { cache } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { ayarlariOku, type MedyaDegeri } from "@/lib/ayarlar";
import { kategoriAdi, KATEGORILER } from "@/lib/kategoriler";
import { videoAdresiCoz, videoBilgisi, type VideoBilgisi } from "@/lib/video";
import { yuklemeAdresi } from "@/lib/yukleme";
import { telefonGoster, telefonNormallestir, telefonUluslararasi } from "@/lib/telefon";

/** Ana sayfadaki öne çıkan proje sayısı (rapor: 6) */
export const ONE_CIKAN_SAYISI = 6;

export type Gorsel = { url: string; genislik: number | null; yukseklik: number | null };

function gorsel(m: MedyaDegeri | undefined | null): Gorsel | null {
  return m ? { url: yuklemeAdresi(m.dosya)!, genislik: m.genislik, yukseklik: m.yukseklik } : null;
}

/** Açılış videosu: dosya adresi + biçim (uzantıdan; kayıtta ilk baytlardan doğrulandı). Poster ayrı ayar. */
function acilisVideosu(m: MedyaDegeri | undefined | null) {
  if (!m) return null;
  return { url: yuklemeAdresi(m.dosya)!, tur: m.dosya.endsWith(".webm") ? "video/webm" : "video/mp4" };
}

function girisVideosu(masaustu: MedyaDegeri | undefined, mobil: MedyaDegeri | undefined) {
  const m = acilisVideosu(masaustu);
  const t = acilisVideosu(mobil);
  if (!m && !t) return null;
  return { masaustu: (m ?? t)!, mobil: (t ?? m)! };
}

function dosyaGorseli(dosya: string | null, g: number | null, y: number | null): Gorsel | null {
  return dosya ? { url: yuklemeAdresi(dosya)!, genislik: g, yukseklik: y } : null;
}

/** "@sekermedya", "sekermedya" ya da tam adres → tam adres */
function sosyalAdres(deger: string, kok: string): string | null {
  const d = deger.trim();
  if (!d) return null;
  if (/^https?:\/\//i.test(d)) return d;
  return `${kok}/${d.replace(/^@/, "")}`;
}

/** "Başlık — açıklama" satırları → adımlar. Tire yoksa satırın tamamı başlıktır; boş satır atlanır. */
function surecAdimlari(metin: string): Array<{ baslik: string; aciklama: string }> {
  return metin.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).map((s) => {
    const [baslik, ...kalan] = s.split(/\s+[—–-]\s+/);
    return { baslik: baslik.trim(), aciklama: kalan.join(" — ").trim() };
  });
}

type ProjeSatiri = {
  id: number; slug: string; baslik: string; kategori: string; musteri: string | null; yil: number | null;
  ozet: string; kapak: string | null; kapakGenislik: number | null; kapakYukseklik: number | null;
  videoSaglayici: string | null; videoKimlik: string | null;
};

export type ProjeKarti = {
  id: number;
  slug: string;
  adres: string;
  baslik: string;
  kategori: string;
  kategoriAdi: string;
  musteri: string | null;
  yil: number | null;
  ozet: string;
  /** Yüklenen kapak; yoksa YouTube küçük resmi; o da yoksa null (tasarım düz zemin çizer) */
  kapak: Gorsel | null;
  video: VideoBilgisi | null;
};

function kart(p: ProjeSatiri): ProjeKarti {
  const video = videoBilgisi(p.videoSaglayici, p.videoKimlik);
  const kapak = dosyaGorseli(p.kapak, p.kapakGenislik, p.kapakYukseklik)
    ?? (video?.kucukResim ? { url: video.kucukResim, genislik: 480, yukseklik: 360 } : null);
  return {
    id: p.id, slug: p.slug, adres: `/projeler/${p.slug}`, baslik: p.baslik, kategori: p.kategori,
    kategoriAdi: kategoriAdi(p.kategori), musteri: p.musteri, yil: p.yil, ozet: p.ozet, kapak, video,
  };
}

const KART_ALANLARI = {
  id: true, slug: true, baslik: true, kategori: true, musteri: true, yil: true, ozet: true,
  kapak: true, kapakGenislik: true, kapakYukseklik: true, videoSaglayici: true, videoKimlik: true,
} as const;

const SIRA = [{ sira: "asc" as const }, { id: "desc" as const }];

/** Tek istekte layout (metadata) ve sayfa aynı veriyi ister: React cache ile bir kez okunur. */
export const vitrinVerisi = cache(async () => {
  await connection();
  const [a, hizmetler, oneCikanlar, markalar, kategoriSayilari] = await Promise.all([
    ayarlariOku(),
    prisma.hizmet.findMany({ where: { aktif: true }, orderBy: SIRA }),
    prisma.proje.findMany({ where: { yayinda: true, oneCikan: true }, orderBy: SIRA, take: ONE_CIKAN_SAYISI, select: KART_ALANLARI }),
    prisma.marka.findMany({ where: { aktif: true }, orderBy: SIRA }),
    prisma.proje.groupBy({ by: ["kategori"], where: { yayinda: true }, _count: { _all: true } }),
  ]);

  const telefon = telefonNormallestir(a.telefon);
  const whatsapp = telefonNormallestir(a.whatsapp) ?? telefon;
  const showreel = videoAdresiCoz(a.showreel);

  return {
    firma: {
      ad: a.firma_adi,
      slogan: a.slogan,
      altSlogan: a.alt_slogan,
      logo: gorsel(a.medya.logo),
    },
    metinler: {
      konumSatiri: a.konum_satiri.trim() || null,
      guvenSatiri: a.guven_satiri.trim() || null,
      surecAdimlari: surecAdimlari(a.surec_adimlari),
      kisaTanitimBaslik: a.kisa_tanitim_baslik,
      kisaTanitim: a.kisa_tanitim,
      hakkimizda: a.hakkimizda,
      canliYayinBaslik: a.canli_yayin_baslik,
      canliYayinMetni: a.canli_yayin_metni,
      droneBaslik: a.drone_baslik,
      droneMetni: a.drone_metni,
      cagriBaslik: a.cagri_baslik,
      cagriMetni: a.cagri_metni,
    },
    medya: {
      /** Açılış videosu: yalnız dosya adresi; poster ayrı. Biçim uzantıdan (mp4/webm). */
      acilisVideosu: acilisVideosu(a.medya.acilis_videosu),
      /** Giriş animasyonu (oturumda bir kez). İkisi de boşsa null → animasyon yok.
       * Yalnız biri yüklüyse o iki ekranda da kullanılır; bileşen tek <video> basar. */
      girisVideosu: girisVideosu(a.medya.giris_videosu, a.medya.giris_videosu_mobil),
      acilisPosteri: gorsel(a.medya.acilis_posteri),
      canliYayinGorseli: gorsel(a.medya.canli_yayin_gorseli),
      droneGorseli: gorsel(a.medya.drone_gorseli),
      hakkimizdaGorseli: gorsel(a.medya.hakkimizda_gorseli),
      paylasimGorseli: gorsel(a.medya.paylasim_gorseli) ?? gorsel(a.medya.acilis_posteri),
      showreel: showreel ? videoBilgisi(showreel.saglayici, showreel.kimlik) : null,
    },
    iletisim: {
      telefon,
      telefonMetni: telefon ? telefonGoster(telefon) : null,
      telefonLinki: telefon ? `tel:+${telefonUluslararasi(telefon)}` : null,
      whatsappLinki: whatsapp ? `https://wa.me/${telefonUluslararasi(whatsapp)}` : null,
      eposta: a.eposta.trim() || null,
      adres: a.adres.trim() || null,
      haritaLink: a.harita_link.trim() || null,
    },
    sosyal: {
      instagram: sosyalAdres(a.instagram, "https://www.instagram.com"),
      youtube: sosyalAdres(a.youtube, "https://www.youtube.com"),
      facebook: sosyalAdres(a.facebook, "https://www.facebook.com"),
      linkedin: sosyalAdres(a.linkedin, "https://www.linkedin.com/company"),
    },
    seo: { baslik: a.seo_baslik.trim(), aciklama: a.seo_aciklama.trim() },
    hizmetler: hizmetler.map((h) => ({ id: h.id, baslik: h.baslik, ozet: h.ozet, ikon: h.ikon })),
    oneCikanProjeler: oneCikanlar.map(kart),
    markalar: markalar.map((m) => ({
      id: m.id, ad: m.ad, url: m.url, logo: dosyaGorseli(m.logo, m.logoGenislik, m.logoYukseklik),
    })),
    /** Yalnız en az bir yayındaki projesi olan kategoriler — boş sekme gösterilmesin */
    kategoriler: KATEGORILER.map((k) => ({
      ...k,
      adet: kategoriSayilari.find((s) => s.kategori === k.kod)?._count._all ?? 0,
    })).filter((k) => k.adet > 0),
  };
});

export type Vitrin = Awaited<ReturnType<typeof vitrinVerisi>>;

/** Projeler sayfası: yayındaki bütün projeler (kategori süzgeci ekranda yapılır;
 * proje sayısı yüzlerle sınırlı, sayfalamaya gerek yok). */
export async function projeListesi(): Promise<ProjeKarti[]> {
  await connection();
  const satirlar = await prisma.proje.findMany({ where: { yayinda: true }, orderBy: SIRA, select: KART_ALANLARI });
  return satirlar.map(kart);
}

/** Proje detay sayfası. Taslak ya da olmayan proje null → sayfa notFound() der. */
export const projeDetayi = cache(async (slug: string) => {
  await connection();
  const p = await prisma.proje.findFirst({
    where: { slug, yayinda: true },
    include: { fotolar: { orderBy: [{ sira: "asc" }, { id: "asc" }] } },
  });
  if (!p) return null;
  // Önceki/sonraki proje: aynı sıralamada komşular (detay sayfasının altındaki gezinme)
  const tum = await prisma.proje.findMany({ where: { yayinda: true }, orderBy: SIRA, select: KART_ALANLARI });
  const i = tum.findIndex((x) => x.id === p.id);
  return {
    ...kart(p),
    aciklama: p.aciklama,
    fotolar: p.fotolar.map((f) => ({
      id: f.id, url: yuklemeAdresi(f.dosya)!, genislik: f.genislik, yukseklik: f.yukseklik, aciklama: f.aciklama,
    })),
    onceki: i > 0 ? kart(tum[i - 1]) : null,
    sonraki: i >= 0 && i < tum.length - 1 ? kart(tum[i + 1]) : null,
    guncelleme: p.guncelleme,
  };
});

export type ProjeDetayi = NonNullable<Awaited<ReturnType<typeof projeDetayi>>>;

/** Galeri sayfası: galeride işaretli fotoğraflar; taslak projenin fotoğrafı görünmez. */
export async function galeri() {
  await connection();
  const fotolar = await prisma.foto.findMany({
    where: { galeride: true, OR: [{ projeId: null }, { proje: { yayinda: true } }] },
    orderBy: [{ sira: "asc" }, { id: "desc" }],
    include: { proje: { select: { slug: true, baslik: true, kategori: true } } },
  });
  return fotolar.map((f) => ({
    id: f.id,
    url: yuklemeAdresi(f.dosya)!,
    genislik: f.genislik,
    yukseklik: f.yukseklik,
    aciklama: f.aciklama,
    proje: f.proje
      ? {
        adres: `/projeler/${f.proje.slug}`, baslik: f.proje.baslik,
        kategori: f.proje.kategori, kategoriAdi: kategoriAdi(f.proje.kategori),
      }
      : null,
  }));
}

/** Site haritası için: yayındaki projelerin adresleri ve son değişiklik tarihi */
export async function siteHaritasiProjeleri() {
  await connection();
  return prisma.proje.findMany({ where: { yayinda: true }, orderBy: SIRA, select: { slug: true, guncelleme: true } });
}
