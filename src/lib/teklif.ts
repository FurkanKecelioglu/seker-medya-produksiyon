// Teklif formunun spam koruması. Üç katman, hiçbiri ziyaretçiyi uğraştırmaz
// (resim doğrulama yok):
//  1. Jeton: form açılınca GET /api/teklif/jeton imzalı bir zaman damgası verir.
//     Gönderim en erken 3 sn, en geç 24 saat sonra kabul edilir. Formu hiç
//     açmadan doğrudan POST atan bot jetonsuz kalır; 3 sn'den hızlı dolduran
//     da insan değildir.
//  2. Bal küpü: ekranda görünmeyen "web_sitesi" alanı. İnsan boş bırakır, alanları
//     körlemesine dolduran bot doldurur. Doluysa kayıt YAZILMAZ ama 201 döner —
//     bota yakalandığını söylemeyiz, yoksa alanı boş bırakmayı öğrenir.
//  3. Hız sınırı: IP başına saatte 5, bütün site için saatte 60 talep.
//
// İmza OTURUM_SIRRI ile atılır (ayrı bir sır daha yönetmek gerekmesin).
import { createHmac, timingSafeEqual } from "node:crypto";

export const JETON_EN_KISA_MS = 3_000;
export const JETON_EN_UZUN_MS = 24 * 60 * 60 * 1000;

function imza(zaman: string): string {
  const sir = process.env.OTURUM_SIRRI;
  if (!sir || sir.length < 32) throw new Error("OTURUM_SIRRI tanımlı değil ya da 32 karakterden kısa");
  return createHmac("sha256", sir).update(`teklif:${zaman}`).digest("base64url");
}

export function jetonUret(simdi = Date.now()): string {
  const z = String(simdi);
  return `${z}.${imza(z)}`;
}

export type JetonSonucu = "gecerli" | "bozuk" | "erken" | "eski";

export function jetonDogrula(jeton: string, simdi = Date.now()): JetonSonucu {
  const m = /^(\d{13})\.([A-Za-z0-9_-]{43})$/.exec(jeton);
  if (!m) return "bozuk";
  const beklenen = Buffer.from(imza(m[1]));
  const gelen = Buffer.from(m[2]);
  if (beklenen.length !== gelen.length || !timingSafeEqual(beklenen, gelen)) return "bozuk";
  const yas = simdi - Number(m[1]);
  if (yas < JETON_EN_KISA_MS) return "erken";
  if (yas > JETON_EN_UZUN_MS) return "eski";
  return "gecerli";
}
