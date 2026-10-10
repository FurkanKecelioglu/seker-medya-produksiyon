// Portföy kategorileri ve hizmet ikonları — ekran adları TEK yerde.
// Bu dosya istemci bileşenlerinden de içe aktarılır: içine prisma/node girmemeli
// (rehber §3.2).

export const KATEGORILER = [
  { kod: "VIDEO", ad: "Video", cogul: "Video Prodüksiyonlar", yol: "video" },
  { kod: "FOTOGRAF", ad: "Fotoğraf", cogul: "Fotoğraf Çekimleri", yol: "fotograf" },
  { kod: "DRONE", ad: "Drone", cogul: "Drone Çekimleri", yol: "drone" },
  { kod: "CANLI_YAYIN", ad: "Canlı Yayın", cogul: "Canlı Yayınlar", yol: "canli-yayin" },
  { kod: "TV", ad: "TV", cogul: "TV ve Program", yol: "tv" },
] as const;

export type KategoriKodu = (typeof KATEGORILER)[number]["kod"];
export const KATEGORI_KODLARI = KATEGORILER.map((k) => k.kod) as unknown as readonly [KategoriKodu, ...KategoriKodu[]];

export function kategoriAdi(kod: string): string {
  return KATEGORILER.find((k) => k.kod === kod)?.ad ?? kod;
}

/** Adresteki ?kategori=drone → DRONE. Bilinmeyen değer null (tümü gösterilir). */
export function kategoriYoldan(yol: string | null | undefined): KategoriKodu | null {
  return KATEGORILER.find((k) => k.yol === yol)?.kod ?? null;
}

/** Hizmet kartında kullanılabilecek ikonlar (lucide-react adları). Panelde seçim
 * listesi bundan çıkar; tasarım yalnız bunları çizmeyi bilmek zorunda. */
export const HIZMET_IKONLARI = [
  "Clapperboard", "Tv", "Radio", "Plane", "Camera", "Mic", "Smartphone", "Scissors",
  "Film", "Video", "Aperture", "MonitorPlay", "Megaphone", "Sparkles", "Users", "Music",
] as const;

export type HizmetIkonu = (typeof HIZMET_IKONLARI)[number];

export const TEKLIF_DURUMLARI = [
  { kod: "YENI", ad: "Yeni" },
  { kod: "ARANDI", ad: "Arandı" },
  { kod: "TEKLIF_VERILDI", ad: "Teklif verildi" },
  { kod: "KAZANILDI", ad: "İş alındı" },
  { kod: "KAPANDI", ad: "Kapandı" },
] as const;

export type TeklifDurumKodu = (typeof TEKLIF_DURUMLARI)[number]["kod"];
export const TEKLIF_DURUM_KODLARI = TEKLIF_DURUMLARI.map((d) => d.kod) as unknown as readonly [TeklifDurumKodu, ...TeklifDurumKodu[]];
