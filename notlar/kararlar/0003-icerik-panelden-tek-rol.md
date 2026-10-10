# 0003 — Bütün içerik panelden; tek rol

**Tarih:** 2026-10-09 · **Durum:** kapandı

- Rapor (§8) "gerçek logo, showreel, portföy, iletişim bilgileri sonra eklenmeli" diyor. Bunların
  hiçbiri koda gömülmez: metinler, iletişim, sosyal medya, logo, açılış videosu/görseli, hizmetler,
  projeler, galeri ve markalar panelden yönetilir. Firma her değişiklik için yazılımcı çağırmasın.
- Varsayılan metinler raporun "Ana sayfa metinleri" bölümünden (`src/lib/ayarlar.ts`).
- **Tek rol:** firma küçük; panele giren herkes her şeyi düzenler. Rol tablosu kurulmadı.
  Hesap panelden açılmaz; `npx tsx tools/yonetici-ac.ts <ad>` ile açılır/sıfırlanır (kurulumu
  yapan kişi). Şifre değişince o hesabın diğer cihazlardaki oturumları düşer.
- Proje **taslak** olarak açılır; kapak/fotoğraf yüklenip "yayında" yapılınca sitede görünür.
- Galeri ayrı tablo değil: `Foto` hem projeye bağlı hem projesiz olabilir, `galeride` bayrağı
  galeri sayfasında görünüp görünmeyeceğini söyler. Taslak projenin fotoğrafı galeride de görünmez.
- Teklif talepleri silinmez; durum değişir (Yeni → Arandı → Teklif verildi → İş alındı / Kapandı).
