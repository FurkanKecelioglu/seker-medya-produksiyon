// Fotoğraf ve açılış videosu yükleme. Dosyalar uygulama dizininin DIŞINDA
// (YUKLEME_DIZINI) durur: `public/` içine yazılan dosya derlemeden sonra eklendiği
// için üretimde sunulmayabilir ve her dağıtımda silinme riski taşır (rehber §7.5/26).
// Sunuş /yuklemeler/<dosya> ucundan (app/yuklemeler/[dosya]/route.ts).
//
// Fotoğraf: her yükleme sharp'tan geçer — boyut sınırı, WebP, EXIF/GPS silinir
// (telefon fotoğrafı çekim yerini taşır — rehber §7.24/136). Saydamlık korunur
// (logo PNG'leri için). AVIF ve ekran genişliğine göre küçük kopyaları Next'in
// görsel iyileştiricisi üretir (next.config.ts images.formats); burada tek ana
// kopya tutulur.
//
// Video: sunucuda yalnız ana sayfanın kısa, sessiz açılış videosu ve giriş animasyonu durur
// (karar 0002). Sunucuda kodlama (ffmpeg) yok — dosya yüklendiği gibi saklanır,
// bu yüzden boyut sınırı sıkı ve biçim dosyanın İLK BAYTLARINDAN doğrulanır
// (uzantıya ya da tarayıcının bildirdiği türe güvenilmez).
//
// Dosya adını ve uzantıyı kullanıcı belirlemez (".html" yükleyip sitede
// çalıştırma yolu kapalı).
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import sharp, { type OutputInfo } from "sharp";
import { KuralHatasi } from "@/lib/http";

export const FOTO_EN_BUYUK_BAYT = 20 * 1024 * 1024;
export const VIDEO_EN_BUYUK_BAYT = 25 * 1024 * 1024;

/** Kullanım yerine göre en uzun kenar. Ana kopya büyük tutulur: 4K ekranda
 * tam ekran açılış görseli bulanık görünmesin; küçüklerini Next üretir. */
export const FOTO_BOYUTU = {
  kapak: 2400,
  foto: 2400,
  logo: 800,
  paylasim: 1200,
} as const;

export function yuklemeDizini(): string {
  const d = process.env.YUKLEME_DIZINI;
  if (!d) throw new Error("YUKLEME_DIZINI tanımlı değil");
  return d;
}

/** Dosya adı yalnız bizim ürettiğimiz biçimde olabilir — yol geçişi (../) imkânsız. */
export function dosyaAdiGecerliMi(ad: string): boolean {
  return /^[a-z0-9_-]{8,64}\.(webp|mp4|webm)$/i.test(ad);
}

export const ICERIK_TURU: Record<string, string> = {
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
};

export function yuklemeAdresi(dosya: string | null | undefined): string | null {
  return dosya ? `/yuklemeler/${dosya}` : null;
}

/** Yükleme hatası kullanıcıya 400 olarak döner. */
export class YuklemeHatasi extends KuralHatasi {
  constructor(mesaj: string) {
    super(400, mesaj);
  }
}

function rastgeleAd(onEk: string, uzanti: string) {
  const govde = randomBytes(9).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "x");
  return `${onEk}-${govde}.${uzanti}`;
}

async function yaz(ad: string, veri: Buffer | Uint8Array) {
  await mkdir(yuklemeDizini(), { recursive: true });
  await writeFile(path.join(yuklemeDizini(), ad), veri);
}

export type KayitliFoto = { dosya: string; genislik: number; yukseklik: number };

export async function fotografKaydet(dosya: unknown, onEk: string, enUzunKenar: number): Promise<KayitliFoto> {
  if (!(dosya instanceof File) || dosya.size === 0) throw new YuklemeHatasi("Fotoğraf seçilmedi");
  if (dosya.size > FOTO_EN_BUYUK_BAYT) throw new YuklemeHatasi("Fotoğraf 20 MB'tan büyük olamaz");
  let cikti: { data: Buffer; info: OutputInfo };
  try {
    cikti = await sharp(Buffer.from(await dosya.arrayBuffer()), { failOn: "error", limitInputPixels: 100_000_000 })
      .rotate() // EXIF yönünü uygula; EXIF'in kendisi çıktıya yazılmıyor
      .resize({ width: enUzunKenar, height: enUzunKenar, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    // HEIC burada AÇILAMAZ: sharp'ın hazır paketi HEVC çözücüsü taşımıyor (yalnız AVIF).
    // iPhone, dosya seçicinin `accept` listesinde HEIC yoksa fotoğrafı kendisi JPEG'e
    // çevirip gönderir — panelde accept="image/jpeg,image/png,image/webp,image/avif" (notlar/API.md).
    throw new YuklemeHatasi("Dosya okunamadı. JPG, PNG, WebP ya da AVIF fotoğraf yükleyin (HEIC desteklenmiyor).");
  }
  const ad = rastgeleAd(onEk, "webp");
  await yaz(ad, cikti.data);
  return { dosya: ad, genislik: cikti.info.width, yukseklik: cikti.info.height };
}

/** MP4: 4.-8. baytlar "ftyp". WebM: EBML başlığı 1A 45 DF A3. */
function videoTuru(bas: Uint8Array): "mp4" | "webm" | null {
  if (bas.length >= 8 && String.fromCharCode(...bas.slice(4, 8)) === "ftyp") return "mp4";
  if (bas.length >= 4 && bas[0] === 0x1a && bas[1] === 0x45 && bas[2] === 0xdf && bas[3] === 0xa3) return "webm";
  return null;
}

export async function videoKaydet(dosya: unknown, onEk: string): Promise<{ dosya: string; boyut: number }> {
  if (!(dosya instanceof File) || dosya.size === 0) throw new YuklemeHatasi("Video seçilmedi");
  if (dosya.size > VIDEO_EN_BUYUK_BAYT) {
    throw new YuklemeHatasi(
      "Video 25 MB'tan büyük olamaz. Kısa (açılış 10-20 sn, giriş animasyonu 6-10 sn), sessiz, sıkıştırılmış bir MP4 yükleyin.",
    );
  }
  const veri = new Uint8Array(await dosya.arrayBuffer());
  const tur = videoTuru(veri);
  if (!tur) throw new YuklemeHatasi("Yalnız MP4 ya da WebM video yüklenebilir");
  const ad = rastgeleAd(onEk, tur);
  await yaz(ad, veri);
  return { dosya: ad, boyut: dosya.size };
}

/** Kayıt silinince dosya da silinir; dosya zaten yoksa sorun değil. */
export async function dosyaSil(dosya: string | null | undefined) {
  if (!dosya || !dosyaAdiGecerliMi(dosya)) return;
  try {
    await unlink(path.join(yuklemeDizini(), dosya));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") console.error("[yukleme] silinemedi:", dosya, e);
  }
}
