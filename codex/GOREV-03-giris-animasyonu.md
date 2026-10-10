# CODEX GÖREV 03 — Kodla giriş animasyonu: "kamera vizöründen açılış"

> **DURUM (2026-10-10): Bu görevi Claude YAZDI** (kullanıcı hız için iş paylaşımı istedi). Kod:
> `src/components/site/giris/` (GirisAnimasyonu.tsx, GirisPerdesi.tsx, giris.module.css), kök layout'ta
> `<html suppressHydrationWarning>`, sınama betiği `codex/e2e-giris.mjs`. Bu metin artık **şartname**dir:
> Codex'in denetim görevi `codex/D03-giris-denetim.md` bu maddelere göre denetler.

> **Tek fazlık görev.** Video dosyası YOK — animasyon tamamen kodla (CSS/SVG, gerekirse küçük JS) yapılır.
> Çıktın Claude tarafından satır satır denetlenecek ve tarayıcıda izlenerek doğrulanacak.

## 0. Önce oku

1. `C:\Users\HP\.claude\PROJE-TECRUBELERI.md` — §7.6 (33 gizleme ≠ silme), §7.21, §7.24, §7.28/159, §9.3.
2. `notlar/API.md` (`medya.girisVideosu`, `medya.acilisPosteri`), `notlar/kararlar/0002` (ek: giriş animasyonu).
3. Örnek desen (video tabanlı, ama kuralları aynı): `C:\Users\HP\Desktop\cankiri-gazozu\src\components\hero\HeroIntro.tsx`
   — oturumda bir kez, "Geç" düğmesi, ESC, reduced-motion, asla kilitli kalmama, H1 perdenin altında DOM'da.
4. Görev 01/02'de kurduğun `Hero`, `HeroVideo`, `globals.css` simgeleri.

## 1. Sınırlar

Senin alanın: `src/components/site/**`, `src/app/(site)/**`, `globals.css`, kök `layout.tsx`'in görünüm kısmı
(yalnız gerekiyorsa küçük bir satır içi betik). **DOKUNMA:** `src/lib/**`, `src/app/api/**`, `prisma/**`, `tests/**`,
`tools/**`, panel. Paket ekleme (Motion vb. YOK — CSS keyframes yeter). Commit/push yok.

## 2. Sahne (kullanıcı seçti) — toplam en çok 4,5 sn

Zemin: açılış görseli (`medya.acilisPosteri`; yoksa koyu degrade). Bütün renkler `:root` simgelerinden; vurgu kırmızı.

| Zaman | Ne olur |
|---|---|
| 0,0–0,6 sn | Tam siyah. Sol üstte kırmızı **REC** noktası belirir ve yanıp söner (1 Hz), yanında "REC" yazısı. Sağ üstte zaman kodu `00:00:00:00` akmaya başlar (saniye:kare, 25 kare). Altta ince vizör bilgileri: "4K · 25P · ISO 800" gibi **arayüz etiketleri** (içerik değil). |
| 0,6–1,6 sn | Dört köşede vizör çerçeve köşeleri (L biçimli ince beyaz çizgiler) çizilerek gelir (SVG `stroke-dashoffset`). Ortada odak karesi. Arkada açılış görseli **çok bulanık** (`blur(24px)`), hafif büyük (`scale(1.15)`), karanlıkta belirir. |
| 1,6–2,8 sn | **Odak çekme:** görsel bulanıktan nete gelir; odak karesi iki kez "tık" diye küçülüp oturur ve kısa süre kırmızı yanar ("AF" etiketi). İnce yatay/dikey üçte bir ızgarası çok soluk görünür. |
| 2,8–4,0 sn | **Geri çekilme:** vizör katmanı (köşeler, yazılar, ızgara) büyüyerek (`scale` 1 → 1,6) ve sönerek ekrandan çıkar; görsel `scale(1.15)` → `scale(1)`; perde açılışın kendisine karışır. |
| 4,0–4,5 sn | Açılıştaki H1 (slogan) ve düğmeler hafifçe yukarı kayarak belirir. Perde DOM'dan değil **görünürlükten** çıkar (`pointer-events: none`, `inert`, `aria-hidden`). |

İsteğe bağlı küçük dokunuş: geri çekilme anında çok kısa, çok hafif film greni ya da kare kenarında kırmızı ışık sızması.
Abartma — sinematik ve sakin.

## 3. Kurallar (hepsi zorunlu)

- **Asla kilitli kalmaz:** animasyon saf CSS `animation-fill-mode: forwards` ile **kendiliğinden** biter. JS hiç
  çalışmasa bile 4,5 sn sonra perde görünmez ve tıklanamaz olur. JS kapalıyken `<noscript>` ile perde hiç çizilmez.
- **Oturumda bir kez:** `sessionStorage` bayrağı. İkinci açılışta perde **ilk boyada bile** görünmemeli (yanıp sönme
  yok): `<head>`'de boyamadan önce çalışan küçük satır içi betik `<html data-giris="gecildi">` yazar, CSS perdeyi
  çizmez. `sessionStorage` erişimi `try/catch` içinde.
- **"Geç" düğmesi** ilk kareden görünür (sağ altta, `type="button"`, ≥ 44 px), **ESC** de geçer. Geçince perde
  0,3 sn'de söner, bayrak yazılır. Enter/Space'i pencereye bağlama (gazoz notu).
- **`prefers-reduced-motion: reduce`** → perde hiç yok. `navigator.connection.saveData` → perde yok.
- **SEO/erişilebilirlik:** H1 ve açılış metni perdenin ALTINDA, DOM'da ilk boyadan var. Perde `aria-hidden="true"`
  (yalnız "Geç" düğmesi erişilebilir — düğme perdenin dışında ya da perde `aria-hidden` olmadan `role` vermeden;
  ekran okuyucu animasyonu dinlemek zorunda kalmamalı). Perde açıkken sayfa kaydırması kilitli, bitince açılır.
- **Yalnız ana sayfada.** Diğer sayfalara doğrudan gelen ziyaretçi animasyon görmez.
- **Video desteği korunur:** `medya.girisVideosu` doluysa (firma ileride panelden film yüklerse) kod animasyonu yerine
  video oynar (gazoz deseni: tek `<video>`, ekran genişliğine göre `masaustu`/`mobil`, `muted playsInline`, donarsa
  kapan). Boşsa (şimdi) kod animasyonu. İkisi aynı "Geç"/oturum/reduced-motion kurallarını paylaşır.
- Zaman kodu JS ile akabilir (`requestAnimationFrame`); JS yoksa sabit `00:00:00:00` kalır — sorun değil.
- Performans: yalnız `transform`, `opacity`, `filter` canlandırılır (düzen kaydıran özellik yok). Görsel `next/image`
  `priority` ile, açılışın kendi görseliyle **aynı dosya** (iki kez inmesin).
- Satır uzunluğu ≤ 140, düğmelerde `type`, renk kodu yalnız `globals.css`'te, Türkçe "neden" yorumları.

## 4. KANIT — rapora komut + çıktı. Çıktısı yapıştırılmayan adım yapılmamış sayılır.

1. `npx tsc --noEmit` boş · `npm run lint` hatasız · `rg -n "[ÃÄÅ]" src` boş ·
   `rg -n "<button(?![^>]*type=)" src --pcre2` boş · `awk 'length > 140'` taraması (Görev 01'deki komut) boş.
2. `npm test` → **90 geçti, 0 kaldı**.
3. Playwright (`channel: "chrome"`), `codex/e2e-giris.mjs`, 1440×900 ve 390×844, iki kez koştur:
   a. Yeni bağlamda `/` → perde görünür; t=0,3 sn REC görünür; t≈1 sn görselin `filter`'ında blur > 10 px;
      t≈2,6 sn blur < 2 px; t=5 sn perde `pointer-events: none` ve görünmez; H1'e tıklanabilir.
   b. "Geç"e bas → 0,5 sn içinde perde gitti; sayfayı yenile → **ilk boyada** perde yok
      (`page.goto` sonrası hemen ölç, `domcontentloaded`).
   c. ESC ile geçme.
   d. `reducedMotion: "reduce"` bağlamı → perde DOM'da çizilmiyor ya da görünmez; H1 hemen görünür.
   e. JS kapalı (`javaScriptEnabled: false`) → perde yok, H1 görünür.
   f. `/projeler`'e doğrudan git → perde yok.
   g. Perde süresince ve sonrasında `pageerror` + `console.error` = 0. 390 px'te `scrollWidth <= 390`.
4. **Kare kare ekran görüntüleri** `codex/ekran/`: `30-giris-0.3s-1440.png`, `31-giris-1.0s-1440.png`,
   `32-giris-2.2s-1440.png`, `33-giris-3.4s-1440.png`, `34-giris-bitti-1440.png`, aynıları `-390` ile.
   Ayrıca Playwright `recordVideo` ile 1440 ve 390 için birer kısa kayıt: `codex/ekran/giris-1440.webm`,
   `giris-390.webm` (kullanıcı izleyecek).
5. `git status --short` ile dokunulan dosyaların listesi; `src/lib`, `src/app/api`, `prisma`, `tests` değişmemiş.

## 5. Yasaklar

Beklentiyi gevşetme, adımı atlama, hatayı yutma. Kaldırılan blok silinir, gizlenmez. Paket ekleme.
Firma adı/slogan gibi içerik koda gömülmez (vitrin verisinden). Sırları rapora yazma. Commit/push yok.

## 6. Rapor — `codex/RAPOR/RAPOR-03.md`

```
## Yapılan adımlar
## Kanıt çıktıları
## Ekran görüntüleri ve kayıtlar
## Yapılamayanlar ve sebebi
## Arka uçtan beklenen
## Kullanıcıdan beklenen
```
