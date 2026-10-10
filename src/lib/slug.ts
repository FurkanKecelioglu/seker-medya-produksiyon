// Proje adresi: "Çorum Belediyesi 29 Ekim Canlı Yayını" → "corum-belediyesi-29-ekim-canli-yayini".
// Türkçe harfler elle çevrilir: toLowerCase "İ"yi "i̇" (noktalı i + birleşik nokta)
// yapar ve NFD ayrıştırması "ı"yı hiç değiştirmez; ikisi de bozuk adres üretir.
const HARF: Record<string, string> = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  â: "a", Â: "a", î: "i", Î: "i", û: "u", Û: "u",
};

export function slugUret(metin: string): string {
  return metin
    .replace(/[çÇğĞıIİöÖşŞüÜâÂîÎûÛ]/g, (h) => HARF[h] ?? h)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-+$/g, "");
}

export const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
