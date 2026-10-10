# 0005 — İş bölümü: arka uç Claude, ön yüz Codex

**Tarih:** 2026-10-09 · **Durum:** kapandı (kullanıcı istedi — berberdeki düzenin aynısı)

- **Claude:** `prisma/`, `src/lib/`, `src/app/api/`, `src/app/yuklemeler/`, `src/app/robots.ts`,
  `src/app/sitemap.ts`, `tools/`, `tests/`, `dagitim/`, belgeler. Ayrıca Codex çıktısının denetimi.
- **Codex:** bütün tasarım ve ekranlar — `src/app/(site)/`, `src/app/panel/` sayfaları,
  `src/components/`, `src/app/globals.css`, `src/app/layout.tsx` (görünüm kısmı; metadata
  üretimi olduğu gibi kalır), fontlar, `public/` altındaki tasarım varlıkları.
- Codex `src/lib/`, API ve şemayı DEĞİŞTİRMEZ; ihtiyaç olursa raporuna yazar, Claude ekler.
- Codex'te `sandbox: danger-full-access`, `approval: never` açık: diskte her yere dokunabilir.
  Sınır yalnız görev metnindeki kuraldır → her görev metnine izinli/yasak klasörler açıkça yazılır,
  teslimden sonra `git status`/`git diff --stat` ile dokunulan dosyalar sayılır.
- Görevler `-c model_reasoning_effort=high` ile verilir (varsayılan "none" tasarım için zayıf).
- Her Codex görevi tek fazdır; çıktısı satır satır denetlenir ve tarayıcıda tıklanarak doğrulanır
  (rehber §9.3): 390 / 768 / 1280 px, konsol hatası yok, form gerçekten gönderiliyor, JS kapalıyken
  form şifre/alan sızdırmıyor, `prefers-reduced-motion`, satır uzunluğu (`awk 'length>140'` → 0).
- Tasarım dili (rapor §5): koyu/siyah sinematik, beyaz-gri tipografi, tek vurgu rengi kırmızı,
  Manrope/Inter/Oswald benzeri, az metin büyük görsel, yumuşak geçişler.
  Müşterinin "HTML/CSS/JS prototipi" (ZIP) gelince referans olarak Codex'e verilecek.
