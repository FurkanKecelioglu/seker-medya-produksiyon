# CODEX D03 — Claude'un yazdığı giriş animasyonunu DENETLE (çapraz denetim)

> Kullanıcı iş paylaşımı istedi: Claude giriş animasyonunu yazdı, sen denetliyorsun (Claude da senin Görev 02'ni
> denetledi). **Görevin önce DENETİM.** Kusur bulursan düzelt, ama her düzeltmeyi raporda "bulgu → kanıt → düzeltme"
> olarak yaz. Bulgu yoksa "yok" yaz, uydurma bulgu üretme. Rapor: `codex/RAPOR/RAPOR-D03.md`. Bitince DUR.

## Şartname
`codex/GOREV-03-giris-animasyonu.md` — §2 sahne, §3 kurallar. Kod: `src/components/site/giris/**`,
`src/app/(site)/page.tsx` (bağlantı satırı), `src/app/layout.tsx` (`suppressHydrationWarning`).

## Bak
1. Satır satır oku: her §3 kuralının kodda karşılığını göster (dosya:satır). Eksik olanı yaz.
2. Bilinen tercihler — doğru mu, değerlendir:
   - Oturum bayrağı animasyonun **başında** yazılıyor (yarıda yenileyen bir daha görmez). Kabul edilebilir mi?
   - "Geç" düğmesi hidrasyondan önce tıklanırsa iş görmez (CSS yine 4,5 sn'de kapatır).
   - `.perde ~ .hero .hero-content` seçicisi: perde ile açılış aynı ebeveynde kardeş olmalı. Ana sayfanın
     yapısında bu doğru mu? Değilse metin süzülmesi hiç çalışmaz — ölç.
   - Film dalı (`medya.girisVideosu` dolu): hiç sınanmadı. `tests/` dışında, panelden gerçek küçük bir MP4 yükleyerek
     (sharp/ffmpeg yok — 1 sn'lik geçerli bir MP4'ü Chrome `MediaRecorder` ya da `canvas.captureStream` ile üretebilirsin,
     webm de kabul) film dalını dene: oynuyor mu, `ended`'da kapanıyor mu, bozuk dosyada perde kilitli kalıyor mu.
     Deneme sonunda videoyu panelden SİL.
3. Erişilebilirlik: perde `aria-hidden`, "Geç" odaklanabilir; ekran okuyucuda H1 hemen okunuyor mu (axe ya da
   erişilebilirlik ağacı çıktısı).
4. Performans: animasyon yalnız `transform/opacity/filter/clip-path` mi; açılış görseli iki kez iniyor mu (ağ
   kaydında `/_next/image` isteklerini say — aynı `url` + `w` bir kez olmalı).

## Kanıt (rapora komut + çıktı)
1. `npx tsc --noEmit` · `npm run lint` · `rg -n "[ÃÄÅ]" src` · `rg -n "<button(?![^>]*type=)" src --pcre2` ·
   `awk 'length > 140'` taraması · `rg -n "#[0-9a-fA-F]{3,8}\b" src/components/site/giris` → boş.
2. `npm test` → 90/90.
3. `node codex/e2e-giris.mjs <çıktı-klasörü>` iki kez — **ana sayfa `/` için** (varsayılan adres `/`; geçici
   `/giris-deneme` sayfası silindi). Çıktıları yapıştır.
4. `node codex/e2e-vitrin.mjs` ve `node codex/e2e-panel.mjs` — perde eklendi diye vitrin/panel testi kırılmamalı.
   Kırılırsa testi perdeyi **geçerek** düzelt (ör. önce `sessionStorage` bayrağı ya da `reducedMotion`), perdeyi kapatma.
5. Kayıtlar: Playwright `recordVideo` → `codex/ekran/giris-1440.webm`, `codex/ekran/giris-390.webm` (kullanıcı izleyecek);
   kareler `30..34-giris-*-1440.png`, `-390.png`.

## Ek — Claude'un Görev 02 denetiminden (panel)
Claude panelini denetledi: kendi bağımsız tarayıcı turu geçti (ayar → sitede göründü → geri alındı, PATCH yalnız değişen
alan, artık kayıt 0, 8 sayfada 390 px taşma yok, site kabuğu yok, `noindex`). İyi iş. Tek görsel kusur:
- **Masaüstü sol menü zemini** uzun sayfalarda yarıda bitiyor (`13-proje-duzenle-1440.png`: menü ~610 px'te kesiliyor,
  altı boş siyah). Menü tam yükseklik ve `position: sticky; top: 0; height: 100vh` (içerik taşarsa kendi içinde kaysın).
  Kanıt: `13b-proje-duzenle-1440.png` (tam sayfa) ve aşağı kaydırılmış ekran boyu görüntü `13c-...-kaydirilmis-1440.png`.

Not: `tests/test-api.mjs` artık şifreyi `.env`'den okuyor (koda yazılı yerel şifre kaldırıldı); `npm test` aynı çalışır.

## Sınırlar
`src/lib`, `src/app/api`, `prisma`, `tests`, `tools` yok. Paket yok. Commit/push yok. Sırları rapora yazma.
Dev'i yeniden başlatman gerekirse işin sonunda AÇIK bırak (`http://localhost:3060` 200 dönmeli — rapora yaz).
