# CODEX GÖREV 01 — Herkese açık site (vitrin): bütün sayfalar + teklif formu

> **Tek fazlık görev.** Yönetim paneli (`/panel`) bu görevde YOK — ona dokunma.
> Çıktın Claude tarafından satır satır denetlenecek ve tarayıcıda tıklanarak doğrulanacak.

## 0. Önce oku

1. `C:\Users\HP\.claude\PROJE-TECRUBELERI.md` — §7 hata kataloğu (özellikle §7.5/24 düğme `type`'ı, §7.6 alt ajan
   kusurları, §7.21 tarayıcı testi, §7.24 herkese açık site, §7.28/159 sayfanın derlemede donması), §9.3, §14.
2. Bu projede: `AGENTS.md`, `PLAN.md`, `notlar/kararlar/` (5 dosya), **`notlar/API.md` (sözleşme)**,
   `notlar/arastirma-tasarim-ornekleri.md` (tasarım yönü), `notlar/arastirma-ercan-seker.md` (firma kim).
3. Müşteri raporu (bağlayıcı): `C:\Users\HP\Desktop\seker_medya_prodüksiyon_web_sitesi_raporu.pdf` — §1 sayfalar,
   §2 ana sayfa sırası, §5 tasarım dili, §6 teknik.
4. **Referans site — kullanıcının beğendiği:** https://www.monsterandbear.com.au — ekran görüntüleri
   `codex/referans/monsterandbear-*.png`. Kopyalama değil, **his**: tam ekran film, üstünde dar-uzun (condensed)
   küçük harfli dev başlık, köşede yuvarlak menü düğmesi, işler tam genişlikte büyük görsel şeritler, bol siyah, tek vurgu.
5. **Next.js 16** eğitim verindekinden farklı. Kod yazmadan önce `node_modules/next/dist/docs/` içindeki ilgili
   sayfaya bak (`params` bir Promise; `middleware.ts` yok, `proxy.ts` var; `next/image` ayarları `next.config.ts`'te hazır).

## 1. Sınırlar — iş bölümü (karar 0005)

**Senin alanın:** `src/app/(site)/**`, `src/components/**`, `src/app/globals.css`, `src/app/layout.tsx`'in görünüm
kısmı, `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/icon.*`, `public/` (yalnız kendi ürettiğin SVG/desen).

**DOKUNMA:** `prisma/**`, `src/lib/**`, `src/app/api/**`, `src/app/yuklemeler/**`, `src/app/robots.ts`,
`src/app/sitemap.ts`, `src/generated/**`, `tools/**`, `tests/**`, `dagitim/**`, `.env`, `package.json`
(yeni paket gerekirse **ekleme**, raporuna yaz). Arka uçta eksik/yanlış görürsen düzeltme — `## Arka uçtan beklenen`'e yaz.

- `src/app/layout.tsx`'teki `generateMetadata` ve `viewport` **olduğu gibi kalır**; yalnız gövdeyi (font, üst/alt bölüm) ekle.
- Mevcut `src/app/page.tsx` GEÇİCİ: sil, ana sayfa `src/app/(site)/page.tsx` olsun.
- Veri **yalnız** `@/lib/vitrin` fonksiyonlarından (`vitrinVerisi`, `projeListesi`, `projeDetayi`, `galeri`).
  Sitedeki hiçbir metin/iletişim bilgisi/firma adı koda gömülmez. Arayüz etiketleri ("Projeler", "Teklif Al",
  "Tümü" gibi) kodda olabilir; **içerik** (slogan, tanıtım, hizmet adları, telefon, adres) asla.

## 2. Tasarım dili (rapor §5 + referans)

- **Koyu sinematik:** zemin siyaha yakın, metin beyaz ve gri tonları, **tek vurgu rengi kırmızı** (sinema/kayıt
  kırmızısı — ör. `#e50914` civarı; kontrastı siyah üstünde AA tutsun). Bütün renkler `:root`'ta CSS değişkeni;
  bileşende renk kodu yok (rehber §14.1).
- **Yazı tipleri** `next/font/google`, `display: swap`, **`latin-ext`** (ş, ğ, ı, İ için şart):
  başlıklar **Oswald** (referanstaki condensed his; büyük başlıklarda küçük harf + sıkı satır aralığı yakışır,
  ama Türkçe `İ/ı` doğru görünmeli — `text-transform: lowercase` KULLANMA, `i̇` üretir; metni olduğu gibi yaz),
  gövde **Manrope** ya da **Inter**.
- **Az metin, büyük görsel.** Kenar boşlukları geniş, bölümler tam yükseklik hissinde.
- Yumuşak geçişler: görünür olunca hafif belirme, görselde üzerine gelince yavaş yakınlaşma, kartta kırmızı çizgi.
  `prefers-reduced-motion` açıksa hepsi kapanır. Kaydırmayı ele geçiren (scroll-jacking) efekt YOK.
- **Mobil öncelikli:** 360–430 px kusursuz; dokunma hedefi ≥ 44 px; yatay kaydırma yok.
- Görsel yoksa (null) kırık ikon asla görünmez: koyu degrade + kategori adı/baş harf gibi şık bir yer tutucu.

## 3. Ortak parçalar

1. **Üst bölüm** (referans gibi sade): solda logo (`firma.logo` yoksa firma adı yazıyla), sağda **kırmızı
   "Proje Teklifi Al"** düğmesi (rapor §1 — her sayfada) ve menü düğmesi. Menü: tam ekran siyah perde, büyük
   Oswald bağlantılar (Ana Sayfa, Hakkımızda, Hizmetler, Projeler, Galeri, İletişim), altta telefon/WhatsApp/sosyal.
   ESC ve bağlantı tıklanınca kapanır, açıkken arka plan kaymaz, odak perdenin içinde kalır. Açılışın üstünde
   şeffaf, kaydırınca koyulaşır. Masaüstünde menü bağlantıları üst çubukta da görünebilir — sen karar ver.
2. **Mobilde sabit WhatsApp düğmesi** (sağ alt, `iletisim.whatsappLinki` varsa; rapor §6). Teklif formu
   sayfasında ve menü açıkken gizlenir (formun gönder düğmesini örtmesin).
3. **Alt bölüm:** firma adı, kısa satır, iletişim (telefon `telefonLinki`, e-posta, adres, `haritaLink`),
   sosyal bağlantılar (yalnız dolu olanlar; Instagram/YouTube/Facebook/LinkedIn ikonları lucide-react),
   sayfa bağlantıları, © yıl. Küçük bir "Yönetim" bağlantısı → `/panel`.
4. **Video kartı** bileşeni (API.md): kapak + oynat düğmesi; **tıklanınca** `gommeAdresi` ile iframe. Sayfa
   açılışında iframe yok. Klavyeyle de oynatılabilir, `title` var.

## 4. Ana sayfa `/` — rapor §2 sırası, bu sırayla

1. **Açılış (tam ekran):** arka planda `medya.acilisVideosu` (varsa; `muted autoplay loop playsInline`, poster
   `medya.acilisPosteri`) — yoksa poster görseli, o da yoksa koyu degrade. Mobil / `saveData` / reduced-motion'da
   video **hiç yüklenmez**, yalnız poster (API.md). Üstünde koyu katman; **referanstaki gibi büyük condensed başlık:
   `firma.slogan`**, altında `firma.altSlogan`, en üstte küçük `metinler.konumSatiri` (null ise yok). İki düğme:
   **"Proje Teklifi Al"** (kırmızı, `/teklif-al`) ve **"Showreel'i izle"** (çizgili; `#showreel`'e kayar, showreel
   yoksa düğme yok). Altta ince "aşağı kaydır" işareti. H1 burada ve DOM'da ilk boyadan var.
   > Not: ileride buraya yapay zekâyla üretilmiş bir giriş animasyonu gelecek (gazoz projesindeki gibi). Şimdilik
   > yalnız arka plan videosu/poster; açılışı bir bileşen olarak ayır ki sonra değiştirilebilsin.
2. **Güven satırı:** `metinler.guvenSatiri` — açılışın hemen altında ince, harf aralıklı şerit. null ise yok.
3. **Kısa tanıtım + süreç:** `kisaTanitimBaslik` + `kisaTanitim`, yanında/altında `surecAdimlari` numaralı şerit
   (01 Fikir — …). Adım sayısını sabit varsayma.
4. **8 hizmet kartı:** `hizmetler` (ikon adı lucide-react'ten; `HIZMET_IKONLARI` dışındaysa varsayılan ikon).
   Masaüstü 4, tablet 2, mobil 1 sütun. Tamamı `/hizmetler`'e bağlantı.
5. **Showreel** (`#showreel`): geniş 16:9 video kartı (`medya.showreel`). null ise bölüm yok.
6. **Öne çıkan projeler:** `oneCikanProjeler` (en çok 6) — **referanstaki gibi büyük görsel kartlar** (karusel
   DEĞİL): kapak, üzerinde `kategoriAdi · yil` ve başlık, müşteri. Kart `/projeler/<slug>`'a gider. Altta
   "Tüm projeler" bağlantısı. Boşsa bölüm yok.
7. **Canlı yayın bölümü:** `canliYayinBaslik` + `canliYayinMetni` + `medya.canliYayinGorseli` — tam genişlik,
   görsel bir yanda metin bir yanda. **Drone bölümü** aynısı, aynalı (`drone*`). Metin boşsa başlık yine çıkar.
8. **Markalar:** `markalar` — gri tonlu logolar, üzerine gelince renkli; `url` varsa yeni sekmede. Boşsa bölüm yok.
9. **Güçlü çağrı:** `cagriBaslik` (dev Oswald) + `cagriMetni` + "Proje Teklifi Al" + WhatsApp + telefon düğmeleri.

JSON-LD: `firmaVerisi(v)` + `jsonLd()` (`@/lib/seo`) ana sayfada `<script type="application/ld+json">` olarak kalır.

## 5. Diğer sayfalar (rapor §1)

Her sayfa `generateMetadata` ile kendi `title`/`description`'ını verir (başlık şablonu layout'ta hazır).

- **`/hakkimizda`:** `metinler.hakkimizda` (paragraflar boş satırla ayrılır → `<p>`), `medya.hakkimizdaGorseli`,
  süreç şeridi, hizmet listesi kısaca, çağrı. Metin boşsa kibar bir kısa tanıtım (`kisaTanitim`) gösterilir.
- **`/hizmetler`:** 8 hizmet büyük satırlar halinde (ikon, başlık, özet) + her birinin altında o hizmete
  uygun "Teklif al" → `/teklif-al?hizmet=<başlık>` (form o hizmeti seçili açar).
- **`/projeler`:** `projeListesi()` — kategori sekmeleri ("Tümü" + `vitrinVerisi().kategoriler`, adetle; yalnız
  dolu olanlar). Seçili kategori URL'de: `/projeler?kategori=<yol>` (`kategoriYoldan` ile çöz; geçersizse Tümü).
  Sekmeler gerçek `<a href>` (JS kapalıyken de çalışsın), sunucu tarafında süzülür. Izgara: masaüstü 3, tablet 2,
  mobil 1. Boş listede düzgün bir "henüz proje yok" alanı.
- **`/projeler/[slug]`:** `projeDetayi(slug)` → null ise `notFound()`. Büyük video kartı (video varsa) ya da kapak;
  künye (kategori, müşteri, yıl); açıklama (paragraflar); fotoğraflar ızgarası (tıklayınca görüntüleyici);
  önceki/sonraki proje; "Benzer bir iş için teklif alın" çağrısı. `generateMetadata`: başlık + özet + kapak (OG).
- **`/galeri`:** `galeri()` — gerçek oranlı masonry (CSS columns ya da grid), kırpmadan; tıklayınca **tam ekran
  görüntüleyici** (ESC kapatır, ← → ve kaydırma ile gezinir, odak yönetimi, açıkken arka plan kaymaz). Fotoğraf
  bir projeye bağlıysa altında proje adı bağlantısı. Boşsa düzgün bir alan.
- **`/iletisim`:** telefon, WhatsApp, e-posta, adres, "Yol tarifi al" (`haritaLink`), sosyal; yanında teklif formu
  (aynı bileşen).
- **`/teklif-al`:** teklif formu, sayfanın asıl işi. Altında kısa güven metni + telefon/WhatsApp alternatifi.
- `not-found.tsx`, `error.tsx`: temaya uygun, Türkçe, ana sayfaya ve teklif formuna bağlantı.

## 6. Teklif formu — kurallar (API.md "Teklif formu" bölümü birebir)

- Alanlar: ad soyad*, telefon* (`type="tel"`, `inputMode="tel"`, `autoComplete="tel"`), e-posta, firma/kurum,
  hizmet (select: `hizmetler` başlıkları + "Diğer"; `?hizmet=` ile seçili gelir), etkinlik/çekim tarihi
  (`type="date"`), mesaj*, **KVKK onay kutusu*** ("Kişisel verilerimin teklif için işlenmesini kabul ediyorum"
  — aydınlatma metni henüz yok, bağlantı koyma; raporda "Kullanıcıdan beklenen"e yaz).
- Mount'ta `GET /api/teklif/jeton`. Gönderimde `POST /api/teklif` gövdesi API.md'deki gibi.
- **Bal küpü `web_sitesi`**: `display:none` DEĞİL — ekran dışı konum, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`.
- `<form method="post">` + gönder düğmesi hidrasyona kadar `disabled`. Gönderirken kilitli ("Gönderiliyor…"),
  çift tıklama tek istek. Hata `{hata, alan}` → `alan` varsa o kutunun altında, yoksa formun üstünde.
  400 `alan: "jeton"` → mesaj + yeni jeton al. 429 → mesajı göster.
- Başarıda form yerine teşekkür paneli: "Talebiniz alındı, en kısa sürede dönüş yapacağız" + WhatsApp düğmesi.

## 7. Teknik (rapor §6)

- Görseller `next/image` (`width/height` ver; `genislik/yukseklik` null ise `fill` + oranlı kutu). Açılış görseli
  `priority`, gerisi lazy. `sizes` doğru yazılsın (mobilde 2400 px indirmesin). YouTube küçük resimleri de next/image.
- Sayfalar sunucu bileşeni; `"use client"` yalnız menü, video kartı, form, görüntüleyici, sekme gibi parçalarda.
- Erişilebilirlik: anlamlı `alt` (anahtar kelime doldurma yok), görünür odak halkası (kırmızı), kontrast AA,
  her ikonlu düğmede `aria-label`, başlık sırası (tek H1).
- **Her düğmede `type` açıkça yazılır. Her `<form>` `method="post"` taşır.**
- Satır uzunluğu: `src/` içinde 140 karakteri aşan satır olmayacak (rehber §7.24/135). Kod yorumları Türkçe, "neden".

## 8. KANIT — her biri rapora komut + çıktı olarak yapıştırılır

Dev sunucusu çalışıyor: `http://localhost:3060` (çalışmıyorsa `npm run dev`). Veritabanında örnek içerik var
(8 proje — YouTube'daki gerçek işler, 4 bölüm görseli, 6 uydurma marka, 8 hizmet). Açılış videosu YOK (poster var).
Panel girişi: `yonetici` / `.env`'deki `SEED_SIFRE_YONETICI` (raporuna yazma).

1. `npx tsc --noEmit` → boş.  2. `npm run lint` → hata yok.
3. `rg -n "[ÃÄÅ]" src` → boş.
4. `rg -n "<button(?![^>]*type=)" src --pcre2` → boş.  `rg -n "<form(?![^>]*method=)" src --pcre2` → boş.
5. `rg -n "#[0-9a-fA-F]{3,8}\b" src --glob "!src/app/globals.css" --glob "!src/generated/**"` → boş ya da gerekçeli.
6. `awk 'length > 140 {print FILENAME":"FNR}' $(rg --files src -g "*.tsx" -g "*.ts" -g "*.css" -g "!src/generated/**")` → boş.
7. `rg -n "Şeker Medya|Hikâyenizi|0532|Çankırı" src -g "!src/lib/**" -g "!src/generated/**"` → boş (içerik gömülmedi).
8. **Ekran görüntüleri** — `playwright-core` kurulu; `chromium.launch({ channel: "chrome" })` (`npx playwright install`
   ÇALIŞTIRMA). `codex/ekran/` altına, tam sayfa:
   `01-ana-390.png`, `01-ana-1440.png`, `02-projeler-390.png`, `03-proje-detay-1440.png`, `04-galeri-acik-390.png`
   (görüntüleyici açık), `05-teklif-390.png`, `06-menu-acik-390.png`.
9. **Uçtan uca gerçek tıklama** (`codex/e2e-vitrin.mjs`, Playwright, Chrome):
   a) ana sayfa → menü aç → "Projeler" → "Drone" sekmesi → kart sayısı = DB'deki yayındaki DRONE sayısı (1) →
      karta tıkla → detay açıldı → video kartına tıkla → `iframe[src*="youtube-nocookie.com/embed/"]` oluştu;
   b) `/teklif-al` → formu doldur → **3 sn bekle** (jeton en erken 3 sn) → gönder → `POST /api/teklif` **201**
      (`waitForResponse` ile yakala) → teşekkür paneli görünür; **gönderimde tam 1 POST** gittiğini say;
   c) aynı formu jetonsuz/hızlı (1 sn içinde) gönder → hata mesajı ekranda, 400;
   d) JS kapalı (`page.route("**/*.js", r => r.abort())`) `/teklif-al` → gönder düğmesi disabled ya da form
      gönderilse bile URL'de `?ad=` yok (rehber §7.24/138); `/projeler?kategori=drone` JS'siz de süzülmüş geliyor;
   e) 390 px'te her sayfada `document.documentElement.scrollWidth <= 390` (yatay taşma yok) — sayfa sayfa yaz.
   Betiği iki kez koştur, iki çıktıyı da yapıştır. `pageerror` + `console.error` sayısı 0 olmalı (yaz).
   Betiğin oluşturduğu teklif kayıtları panelde kalır — sorun değil, adlarını "E2E Test" yap.
10. `git status --short` → `src/lib`, `src/app/api`, `prisma`, `tests`, `tools` görünmemeli (yapıştır).

## 9. Yasaklar

- Beklentiyi gevşetme, adımı atlama, hatayı yutma. Yapamadığını `## Yapılamayanlar` altına yaz.
- Bir bloğu kaldırman gerekiyorsa SİL; `hidden`/`display:none` ile gizleme (rehber §7.6/33). (Bal küpü istisna değil:
  o ekran dışına konumlanır.)
- Dış kaynaktan görsel/font hotlink etme (fontlar `next/font` ile kendi sunucumuzdan gelir). YouTube yalnız
  `youtube-nocookie` gömme + `i.ytimg.com` küçük resim (next.config'de izinli).
- Uydurma müşteri, ödül, rakam yazma. Git commit/push YAPMA. Sırları (şifre, `.env` değerleri) rapora yazma.

## 10. Rapor — `codex/RAPOR/RAPOR-01.md`

```
## Yapılan adımlar
## Kanıt çıktıları        (komut + çıktı, olduğu gibi)
## Ekran görüntüleri      (dosya adları)
## Yapılamayanlar ve sebebi
## Arka uçtan beklenen    (API/veri eksikleri — Claude ekleyecek)
## Kullanıcıdan beklenen  (logo, açılış videosu, KVKK metni, gerçek içerik vb.)
```
