export type Medya = { url: string; genislik: number | null; yukseklik: number | null };
export type Foto = Medya & { id: number; aciklama: string | null; galeride: boolean };
export type Proje = {
  id: number; baslik: string; kategori: string; slug: string; adres: string; ozet: string;
  musteri: string | null; yil: number | null; aciklama: string | null; videoAdresi: string | null;
  oneCikan: boolean; yayinda: boolean; kapak: Medya | null; video: { kucukResim: string | null } | null;
};
export type Hizmet = { id: number; baslik: string; ozet: string; ikon: string; aktif: boolean };
export type Marka = { id: number; ad: string; url: string | null; aktif: boolean; logo: Medya | null };
export type Talep = {
  id: number; ad: string; olusturmaMetni: string; hizmet: string | null; etkinlikTarihiMetni: string | null;
  firma: string | null; eposta: string | null; mesaj: string; durum: string; durumAdi: string;
  icNot: string | null; whatsappLinki: string; telefonLinki: string; telefonMetni: string;
};
export type Sayfali = { toplam: number; sayfa: number; sayfaBoyu: number };
export type Ayarlar = {
  metin: Record<string, string>; medya: Record<string, Medya | null>;
  alanlar: { metin: { anahtar: string; etiket: string; enUzun: number }[];
    medya: { anahtar: string; etiket: string; tur: string }[] };
};
