// Site ayarları — anahtar listesi, varsayılanlar ve sınırlar TEK yerde.
// Metinler, iletişim bilgileri ve görseller koda gömülmez; panelden değişir
// (rehber §4.5). Varsayılan metinler raporun "Ana sayfa metinleri" bölümünden.
//
// İki tür ayar var:
//  - METİN ayarları: düz metin (iletişim, sosyal medya, bölüm metinleri)
//  - MEDYA ayarları: YUKLEME_DIZINI'ndeki dosya + boyutu, JSON olarak saklanır
//    ({"dosya":"…","genislik":…,"yukseklik":…}). Boyut, ekranda görsel yüklenirken
//    sayfanın zıplamaması (CLS) için gerekli.
import { prisma } from "@/lib/prisma";

type MetinAyari = { varsayilan: string; enUzun: number; etiket: string };

export const METIN_AYARLARI = {
  firma_adi: { varsayilan: "Şeker Medya Prodüksiyon", enUzun: 80, etiket: "Firma adı" },
  slogan: { varsayilan: "Hikâyenizi görüntüye, görüntünüzü etkiye dönüştürüyoruz.", enUzun: 160, etiket: "Slogan" },
  alt_slogan: {
    varsayilan: "Profesyonel video, fotoğraf, canlı yayın, drone ve post-prodüksiyon çözümleri.",
    enUzun: 200, etiket: "Açılıştaki alt metin",
  },
  /** Açılışın üstündeki küçük satır — şehir adı yerel aramada işe yarar (notlar/arastirma-tasarim-ornekleri.md) */
  konum_satiri: { varsayilan: "Çankırı merkezli · Türkiye geneli", enUzun: 80, etiket: "Açılıştaki konum satırı" },
  /** Açılışın altındaki ince şerit; boşsa çizilmez. Rakam yazılacaksa firmaya teyit ettirilir. */
  guven_satiri: { varsayilan: "", enUzun: 160, etiket: "Güven satırı (ör. 20+ yıl saha deneyimi · Canlı yayın · Drone)" },
  kisa_tanitim_baslik: { varsayilan: "Fikrinizi görüntüye dönüştürüyoruz.", enUzun: 120, etiket: "Tanıtım başlığı" },
  kisa_tanitim: {
    varsayilan: "Projenin ilk fikrinden çekim aşamasına, kurgudan yayına kadar tüm prodüksiyon sürecini tek çatı altında yönetiyoruz.",
    enUzun: 600, etiket: "Kısa tanıtım (ana sayfa)",
  },
  /** Raporun "ilk fikrinden … yayına kadar" cümlesinin adımları. Her satır bir adım: "Başlık — açıklama" */
  surec_adimlari: {
    varsayilan: [
      "Fikir — İhtiyacı dinliyor, hikâyeyi ve çekim planını birlikte kuruyoruz.",
      "Çekim — Kamera, ışık, ses ve drone ekibiyle sahadayız.",
      "Kurgu — Kurgu, renk, ses ve grafikle hikâyeyi tamamlıyoruz.",
      "Yayın — Teslim, canlı yayın ya da sosyal medya için hazır dosyalar.",
    ].join("\n"),
    enUzun: 1000, etiket: "Süreç adımları (her satır bir adım: Başlık — açıklama)",
  },
  /** Hakkımızda sayfası; paragraflar boş satırla ayrılır */
  hakkimizda: { varsayilan: "", enUzun: 5000, etiket: "Hakkımızda metni" },
  canli_yayin_baslik: { varsayilan: "Çok kameralı canlı yayın", enUzun: 120, etiket: "Canlı yayın bölümü başlığı" },
  canli_yayin_metni: { varsayilan: "", enUzun: 800, etiket: "Canlı yayın bölümü metni" },
  drone_baslik: { varsayilan: "Gökyüzünden bakış", enUzun: 120, etiket: "Drone bölümü başlığı" },
  drone_metni: { varsayilan: "", enUzun: 800, etiket: "Drone bölümü metni" },
  cagri_baslik: { varsayilan: "Bir sonraki projeniz için konuşalım.", enUzun: 120, etiket: "İletişim çağrısı başlığı" },
  cagri_metni: { varsayilan: "", enUzun: 400, etiket: "İletişim çağrısı metni" },

  /** 05XXXXXXXXX — kayıtta normalleştirilir (lib/telefon.ts) */
  telefon: { varsayilan: "", enUzun: 20, etiket: "Telefon" },
  /** Boşsa telefon numarası kullanılır */
  whatsapp: { varsayilan: "", enUzun: 20, etiket: "WhatsApp numarası" },
  eposta: { varsayilan: "", enUzun: 120, etiket: "E-posta" },
  adres: { varsayilan: "", enUzun: 300, etiket: "Adres" },
  /** Google Haritalar'da açılacak bağlantı (yol tarifi) */
  harita_link: { varsayilan: "", enUzun: 500, etiket: "Google Haritalar bağlantısı" },
  /** Kullanıcı adı ya da tam adres; ekranda tam adrese çevrilir */
  instagram: { varsayilan: "", enUzun: 200, etiket: "Instagram" },
  youtube: { varsayilan: "", enUzun: 200, etiket: "YouTube kanalı" },
  facebook: { varsayilan: "", enUzun: 200, etiket: "Facebook" },
  linkedin: { varsayilan: "", enUzun: 200, etiket: "LinkedIn" },
  /** Showreel: YouTube/Vimeo bağlantısı; kayıtta lib/video.ts ile doğrulanır */
  showreel: { varsayilan: "", enUzun: 300, etiket: "Showreel video bağlantısı" },

  /** Arama sonucunda görünen başlık / açıklama. Boşsa firma adı + slogandan türetilir. */
  seo_baslik: { varsayilan: "", enUzun: 70, etiket: "Arama başlığı" },
  seo_aciklama: { varsayilan: "", enUzun: 170, etiket: "Arama açıklaması" },
} as const satisfies Record<string, MetinAyari>;

export type MetinAnahtari = keyof typeof METIN_AYARLARI;
export const METIN_ANAHTARLARI = Object.keys(METIN_AYARLARI) as MetinAnahtari[];

/** Medya ayarları ve her birinin türü. "video" yalnız açılış videosu. */
export const MEDYA_AYARLARI = {
  acilis_videosu: { tur: "video", etiket: "Açılış videosu (sessiz, 10-20 sn, en çok 25 MB)" },
  /** Giriş animasyonu: oturumda bir kez, açılışın üstünde oynayan kısa film (6-10 sn, sessiz).
   * Boşsa giriş animasyonu hiç yoktur. Mobil (9:16) ayrı dosya: dar ekranda yatay video
   * ya küçük kalır ya kırpılır. Biri boşsa diğeri kullanılır (lib/vitrin.ts). */
  giris_videosu: { tur: "video", etiket: "Giriş animasyonu — masaüstü (yatay 16:9, sessiz, 6-10 sn)" },
  giris_videosu_mobil: { tur: "video", etiket: "Giriş animasyonu — telefon (dikey 9:16, sessiz, 6-10 sn)" },
  acilis_posteri: { tur: "foto", etiket: "Açılış görseli (video yüklenene kadar ve mobilde görünür)" },
  logo: { tur: "foto", etiket: "Logo (saydam PNG önerilir)" },
  canli_yayin_gorseli: { tur: "foto", etiket: "Canlı yayın bölümü görseli" },
  drone_gorseli: { tur: "foto", etiket: "Drone bölümü görseli" },
  hakkimizda_gorseli: { tur: "foto", etiket: "Hakkımızda görseli" },
  /** WhatsApp / sosyal medya paylaşım önizlemesi. Boşsa açılış görseli kullanılır. */
  paylasim_gorseli: { tur: "foto", etiket: "Paylaşım görseli (1200×630)" },
} as const;

export type MedyaAnahtari = keyof typeof MEDYA_AYARLARI;
export const MEDYA_ANAHTARLARI = Object.keys(MEDYA_AYARLARI) as MedyaAnahtari[];

export type MedyaDegeri = { dosya: string; genislik: number | null; yukseklik: number | null };

export type Ayarlar = Record<MetinAnahtari, string> & { medya: Partial<Record<MedyaAnahtari, MedyaDegeri>> };

function medyaCoz(ham: string): MedyaDegeri | null {
  try {
    const j = JSON.parse(ham) as Partial<MedyaDegeri>;
    if (typeof j.dosya !== "string" || !j.dosya) return null;
    return {
      dosya: j.dosya,
      genislik: typeof j.genislik === "number" ? j.genislik : null,
      yukseklik: typeof j.yukseklik === "number" ? j.yukseklik : null,
    };
  } catch {
    // Bozuk değer sessizce "yok" sayılmasın — günlükte iz kalsın (rehber §4.4)
    console.error("[ayarlar] medya ayarı okunamadı:", ham);
    return null;
  }
}

export async function ayarlariOku(): Promise<Ayarlar> {
  const satirlar = await prisma.ayar.findMany();
  const metin = Object.fromEntries(METIN_ANAHTARLARI.map((k) => [k, METIN_AYARLARI[k].varsayilan])) as Record<MetinAnahtari, string>;
  const medya: Ayarlar["medya"] = {};
  for (const s of satirlar) {
    if (s.anahtar in METIN_AYARLARI) metin[s.anahtar as MetinAnahtari] = s.deger;
    else if (s.anahtar in MEDYA_AYARLARI) {
      const m = medyaCoz(s.deger);
      if (m) medya[s.anahtar as MedyaAnahtari] = m;
    }
  }
  return { ...metin, medya };
}

export function medyaDegeriYaz(m: MedyaDegeri): string {
  return JSON.stringify(m);
}
