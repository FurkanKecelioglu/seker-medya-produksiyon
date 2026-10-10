// Doğrulama şemaları. Route dosyaları handler dışında bir şey dışa aktaramadığı
// için ortak şemalar burada durur. Her metin alanında üst sınır var (rehber §3.7):
// sınırsız alan, bir gün yapıştırılan 2 MB'lık metinle sayfayı okunmaz yapar.
import { z } from "zod";
import { HIZMET_IKONLARI, KATEGORI_KODLARI, TEKLIF_DURUM_KODLARI } from "@/lib/kategoriler";
import { SLUG_DESENI } from "@/lib/slug";
import { gunGecerliMi } from "@/lib/tarih";

/** Boş metni null'a çevirir: "" ile null'un ikisi birden kayıtta durmasın. */
const bosOlabilir = (enUzun: number) =>
  z.string().trim().max(enUzun, `En fazla ${enUzun} karakter`).nullable().optional()
    .transform((v) => (v ? v : null));

export const hizmetSemasi = z.object({
  baslik: z.string().trim().min(2, "Başlık en az 2 karakter").max(80, "Başlık en fazla 80 karakter"),
  ozet: z.string().trim().min(2, "Kısa açıklama yazın").max(300, "Kısa açıklama en fazla 300 karakter"),
  ikon: z.enum(HIZMET_IKONLARI, { error: "Listeden bir ikon seçin" }),
  aktif: z.boolean().optional(),
});

const yil = z.number().int().min(1990, "Yıl 1990'dan önce olamaz").max(2100, "Yıl geçersiz");

export const projeSemasi = z.object({
  baslik: z.string().trim().min(2, "Başlık en az 2 karakter").max(120, "Başlık en fazla 120 karakter"),
  /** Boş bırakılırsa başlıktan üretilir */
  slug: z.string().trim().toLowerCase().max(100).regex(SLUG_DESENI, "Adres yalnız küçük harf, rakam ve tire içerebilir")
    .nullable().optional().or(z.literal("").transform(() => null)),
  kategori: z.enum(KATEGORI_KODLARI, { error: "Kategori seçin" }),
  musteri: bosOlabilir(120),
  yil: yil.nullable().optional(),
  ozet: z.string().trim().min(2, "Kısa açıklama yazın").max(300, "Kısa açıklama en fazla 300 karakter"),
  aciklama: bosOlabilir(10000),
  /** YouTube/Vimeo bağlantısı; boş = videosuz proje. Ayrıştırma uçta (lib/video.ts). */
  videoAdresi: bosOlabilir(300),
  oneCikan: z.boolean().optional(),
  yayinda: z.boolean().optional(),
});

export const fotoGuncelleSemasi = z.object({
  aciklama: bosOlabilir(200),
  galeride: z.boolean().optional(),
  projeId: z.number().int().positive().nullable().optional(),
});

export const markaSemasi = z.object({
  ad: z.string().trim().min(1, "Marka adını yazın").max(120),
  url: bosOlabilir(300).refine((v) => !v || /^https?:\/\/\S+$/i.test(v), "Adres http:// ya da https:// ile başlamalı"),
  aktif: z.boolean().optional(),
});

export const siralamaSemasi = z.object({
  tur: z.enum(["hizmet", "proje", "foto", "marka"]),
  idler: z.array(z.number().int().positive()).min(1).max(1000)
    .refine((a) => new Set(a).size === a.length, "Aynı kayıt iki kez gönderildi"),
});

export const teklifSemasi = z.object({
  ad: z.string().trim().min(2, "Adınızı yazın").max(80, "Ad en fazla 80 karakter"),
  telefon: z.string().trim().min(10, "Telefon numaranızı yazın").max(20),
  eposta: bosOlabilir(120).refine((v) => !v || z.email().safeParse(v).success, "E-posta adresi geçersiz"),
  firma: bosOlabilir(120),
  hizmet: bosOlabilir(80),
  etkinlikTarihi: bosOlabilir(10).refine((v) => !v || gunGecerliMi(v), "Tarih geçersiz"),
  mesaj: z.string().trim().min(10, "Projenizi birkaç cümleyle anlatın").max(3000, "Mesaj en fazla 3000 karakter"),
  kvkk: z.literal(true, { error: "Kişisel verilerin işlenmesine onay vermeniz gerekiyor" }),
  jeton: z.string().max(100),
  /** Bal küpü — ekranda görünmez, boş gelmeli (lib/teklif.ts) */
  web_sitesi: z.string().max(500).optional(),
});

export const teklifGuncelleSemasi = z.object({
  durum: z.enum(TEKLIF_DURUM_KODLARI).optional(),
  icNot: bosOlabilir(3000),
});
