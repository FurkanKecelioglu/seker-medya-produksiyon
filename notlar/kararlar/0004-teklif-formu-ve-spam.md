# 0004 — Teklif formu: panele düşer, spam koruması görünmez

**Tarih:** 2026-10-09 · **Durum:** kısmen açık (bildirim kanalı)

- "Proje Teklifi Al" formu talebi veritabanına yazar; panelde liste + durum + iç not +
  tek tıkla WhatsApp/telefon dönüşü (wa.me — mesaj kendiliğinden gitmez, maliyetsiz).
- Spam koruması ziyaretçiyi uğraştırmaz (resimli doğrulama yok), üç katman (`src/lib/teklif.ts`):
  1. İmzalı zaman jetonu: form açılınca alınır, gönderim en erken 3 sn, en geç 24 saat sonra.
  2. Görünmeyen bal küpü alanı (`web_sitesi`): doluysa kayıt yazılmaz ama 201 döner.
  3. Hız sınırı: IP başına saatte 5, sitenin tamamına saatte 60.
- KVKK onay kutusu zorunlu. Aydınlatma metni firmadan gelecek (açık).
- **Açık — bildirim:** yeni talep gelince firmaya nasıl haber gidecek? Seçenekler:
  (a) e-posta — SMTP hesabı gerekir (Yusuf/firma sağlar), (b) web push — panel PWA olarak telefona
  kurulur, VAPID canlıda bir kez üretilir. Şimdilik yalnız panelde rozet (`/api/panel/ben` → `yeniTeklif`).
  Karar Yusuf ve firmayla konuşulunca verilecek.
