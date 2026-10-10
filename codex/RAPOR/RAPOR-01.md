## Yapılan adımlar

10 Ekim 2026 — CODEX GÖREV 01. Ön izleme: http://localhost:3060.

- AGENTS.md, PLAN.md, beş karar, API sözleşmesi, iki araştırma, müşteri PDF'si ve proje tecrübeleri okundu.
  Next.js 16.3.8'in yerel sayfa/layout, metadata, font, görsel ve hata belgeleri incelendi.
- Referansın tam ekran film, dar başlık, sade menü ve büyük proje şeritleri hissi kullanıldı.
  [Monster & Bear](https://www.monsterandbear.com.au/) kopyalanmadı; kendi marka içeriği vitrin verisinden gelir.
- Ana sayfa, Hakkımızda, Hizmetler, Projeler, proje detayı, Galeri, İletişim ve Teklif Al tamamlandı.
  Geçici src/app/page.tsx kaldırıldı. Ana sayfa bölümleri sözleşmedeki sırayla yerleştirildi.
- Oswald ve Manrope next/font/google ile latin-ext, display: swap kullanır. Koyu tema ve kırmızı vurgu
  globals.css değişkenlerindedir. Başlık metinlerine lowercase dönüşümü uygulanmaz.
- Firma adı, metinler, iletişim, medya, hizmetler, projeler ve markalar yalnız vitrin fonksiyonlarından gelir.
  Kategoriler/SEO/İstanbul tarihi için mevcut yardımcılar okunur; içerik olarak bağımsız veri kaynağı kullanılmaz.
- Menü ve görüntüleyici native dialog kullanır: odak döngüsü, ESC, odak iadesi ve arka plan kilidi var.
  Galeride gerçek oranlar, yön tuşları ve dokunarak gezinme; videoda tıklayana kadar iframe yok.
- Ayrı Hero/HeroVideo bileşenleri gelecekteki giriş çalışmasına hazırdır. Bu fazda giriş animasyonu eklenmedi.
  Mobil, reduced-motion ve saveData koşulunda arka plan video elemanı oluşturulmaz; poster sunucudan gelir.
- Teklif formunda gerçek jeton, sunucu hataları, alan bazlı mesaj, jeton yenileme, KVKK, ekran dışı bal küpü,
  hidrasyon öncesi disabled gönderim, çift tıklama kilidi ve teşekkür paneli var. İletişimde aynı bileşen kullanılır.
- Her sayfada metadata, ana sayfada firma JSON-LD, proje detayında kapak OG; Türkçe 404 ve hata ekranı eklendi.
  Root layout generateMetadata ve viewport korunarak yalnız font/gövde görünümü düzenlendi.
- Mobil WhatsApp teklif sayfasında ve açık menüde yok. Yönetim bağlantısında prefetch kapalıdır;
  bu fazda panel ekranı mevcut olmadığı için gereksiz arka plan 404 isteği oluşmaz.
- Tailwind kaynak taraması yalnız uygulama ve bileşenlere sınırlandı. Kanıt günlüklerinin yazılması dev'de
  gereksiz yeniden yükleme üretmez. Dayanak: [Tailwind kaynak taraması](https://tailwindcss.com/docs/detecting-classes-in-source-files).
- Dev .next dizinine üretim derlemesi yazılmadı. Ayrı TEMP kaynak kopyasında Next build çalıştırıldı;
  .env kopyalanmadan süreç ortamına aktarıldı. TZ=UTC prova sunucusu 3061'de ayrıca sınandı.
- Yeni paket eklenmedi; commit, push ve yayın yapılmadı. Ön yüz kaynakları ve codex kanıt araçları düzenlendi.

Doğrulama notları:

- E2E gerçek Chrome ile iki dev turu ve bir üretim turudur. Başarılı gönderim gerçekten DB'ye eklenir;
  adları E2E Test'tir. Her tur çift tıklamada yalnız bir POST ve DB'de bir kayıt artışı doğrular.
- Yerel API test turları kota için ayrı TEST-NET X-Real-IP başlığı kullanır. Bu başlık yalnız localhost API'ye gider.
  Hızlı gönderimin 400'ü gerçek API yanıtıdır. Ek kontrolün alan-hata/429 yanıtları yalnız istemci sunumu benzetimidir;
  mevcut npm test gerçek 429, KVKK, bozuk jeton, bal küpü ve tarih denetimlerini ayrıca doğrular.
- Üretim çıktısında tüm içerik sayfaları ƒ (dinamik). İlk HTML'de H1/description/OG, 404'te HTTP 404/noindex denetlendi.
- Kırmızı düğme/beyaz kontrastı yaklaşık 4,79:1; kırmızı metin/koyu zemin 6,30:1; gri metin/kart 8,33:1.
- Prova klasörü taşınırken PowerShell junction'ı izleyerek paket dosyalarını taşıdı. İşlem durduruldu,
  26.492 dosya geri alındı ve SHA-256 karşılaştırması farklı/eksik=0 verdi. Kaynak ve DB bu olayda değişmedi.
  Ardından dev yeniden başlatıldı; iki tam dev turu, üretim derlemesi ve npm test başarıyla tamamlandı.

## Kanıt çıktıları

Boş rg çıktısında çıkış 1, eşleşme bulunmadığı anlamına gelir. Aşağıdaki metinler UTF-8 günlüklerden aynen alınmıştır.
Toplu kontrolün çıkış 1'i korunan dosyalarda eşzamanlı değişiklik saptamasındandır; ayrıntısı aşağıdadır.

### Tür denetimi, lint, taramalar ve git

Komut:

```text
node codex/kanit-topla.mjs
(Betiğin çalıştırdığı her gerçek komut aşağıda $ ile yazılıdır.)
```

Çıktı:

```text
$ npx tsc --noEmit
[çıkış: 0]
$ npm run lint

> seker-medya@0.1.0 lint
> eslint

[çıkış: 0]
$ rg -n "[ÃÄÅ]" src
[çıkış: 1]
$ rg -n "<button(?![^>]*type=)" src --pcre2
[çıkış: 1]
$ rg -n "<form(?![^>]*method=)" src --pcre2
[çıkış: 1]
$ rg -n "#[0-9a-fA-F]{3,8}\b" src --glob "!src/app/globals.css" --glob "!src/generated/**"
src\app\layout.tsx:12:export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };
[çıkış: 0]
$ rg -n "Şeker Medya|Hikâyenizi|0532|Çankırı" src -g "!src/lib/**" -g "!src/generated/**"
src\app\api\panel\ayarlar\route.ts:50:    // Kayıtta normalleştirilir: ekrandaki "0532 …", tel: ve wa.me bağlantısı tek biçimden üretilir
[çıkış: 0]
$ node codex/satir-kontrol.mjs
src/lib/yukleme.ts:108 (151)
[çıkış: 0]
$ node codex/korunan-kontrol.mjs
DEĞİŞMİŞ: C:\Users\HP\Desktop\produksiyon\src\lib\ayarlar.ts
DEĞİŞMİŞ: C:\Users\HP\Desktop\produksiyon\src\lib\vitrin.ts
DEĞİŞMİŞ: C:\Users\HP\Desktop\produksiyon\src\lib\yukleme.ts
DEĞİŞMİŞ: C:\Users\HP\Desktop\produksiyon\src\app\api\panel\ayarlar\medya\[anahtar]\route.ts
DEĞİŞMİŞ: C:\Users\HP\Desktop\produksiyon\tests\test-api.mjs
Korunan dosya sayısı: 60; değişen: 5
[çıkış: 1]
$ git status --short
?? .env.example
?? .gitattributes
?? .gitignore
?? AGENTS.md
?? CLAUDE.md
?? PLAN.md
?? codex/
?? dagitim/
?? eslint.config.mjs
?? next.config.ts
?? notlar/
?? package-lock.json
?? package.json
?? postcss.config.mjs
?? prisma.config.ts
?? prisma/
?? src/
?? tests/
?? tools/
?? tsconfig.json
[çıkış: 0]
```

### Gerçek awk satır denetimi

Komut:

```text
LC_ALL=en_US.UTF-8 MSYS_NO_PATHCONV=1
awk 'length > 140 {print FILENAME":"FNR}' $(rg --files src --path-separator / -g "*.tsx" -g "*.ts" -g "*.css" -g "!src/generated/**")
(Git Bash; node codex/awk-kontrol.mjs)
```

Çıktı:

```text
src/lib/yukleme.ts:108
```

### Ön yüz kapsamının satır denetimi

Komut:

```text
node codex/on-yuz-kontrol.mjs
```

Çıktı:

```text
Ön yüz kapsamı: 30 TS/TSX/CSS dosyası; 140 karakteri aşan satır: 0
```

### Görev başındaki git durumu

Komut:

```text
git status --short
```

Çıktı:

```text
﻿?? .env.example
?? .gitattributes
?? .gitignore
?? AGENTS.md
?? CLAUDE.md
?? PLAN.md
?? codex/
?? dagitim/
?? eslint.config.mjs
?? next.config.ts
?? notlar/
?? package-lock.json
?? package.json
?? postcss.config.mjs
?? prisma.config.ts
?? prisma/
?? src/
?? tests/
?? tools/
?? tsconfig.json
```

### E2E — dev, birinci tur

Komut:

```text
node codex/e2e-vitrin.mjs
```

Çıktı:

```text
DB: yayındaki DRONE sayısı = 1
Yerel test kotası adresi (TEST-NET): 192.0.2.65
a) Menü → Projeler → Drone: 1 kart; detay açıldı; tıklamayla youtube-nocookie iframe oluştu.
Galeri: açılma, yön tuşları, gerçek dokunma kaydırması, ESC, odak iadesi geçti.
b) 3.1 sn bekleme → gerçek POST 201; teşekkür paneli; POST sayısı = 1; DB kayıt artışı = 1.
c) Taze jetonla hızlı gönderim 42 ms → gerçek 400; hata ekranda; yeni jeton alındı.
d) JS dosyaları engelli: teklif gönderimi disabled, URL alan sızdırmıyor; Drone sunucuda süzülmüş = 1.
e) /: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /hakkimizda: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /hizmetler: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /projeler: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /projeler/ilgaz-zirvesi-korkma: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /galeri: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /iletisim: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /teklif-al: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
Ek responsive: 360px, 5 sayfa, taşma yok.
Ek responsive: 430px, 5 sayfa, taşma yok.
Ek responsive: 768px, 5 sayfa, taşma yok.
Ek responsive: 1280px, 5 sayfa, taşma yok.
Hizmet → Teklif al: URL ile hizmet seçili açıldı.
Reduced motion: video yok; CSS hareketler kapalı.
Menü: ESC ve odak iadesi geçti.
Beklenen HTTP red konsol kayıtları (400): 1
JS kapalı senaryosunda bilinçli .js engelleme konsol kayıtları: 0
pageerror + uygulama console.error: 0
SONUÇ: TÜM VİTRİN SENARYOLARI GEÇTİ
```

### E2E — dev, ikinci tur

Komut:

```text
node codex/e2e-vitrin.mjs
```

Çıktı:

```text
DB: yayındaki DRONE sayısı = 1
Yerel test kotası adresi (TEST-NET): 192.0.2.130
a) Menü → Projeler → Drone: 1 kart; detay açıldı; tıklamayla youtube-nocookie iframe oluştu.
Galeri: açılma, yön tuşları, gerçek dokunma kaydırması, ESC, odak iadesi geçti.
b) 3.1 sn bekleme → gerçek POST 201; teşekkür paneli; POST sayısı = 1; DB kayıt artışı = 1.
c) Taze jetonla hızlı gönderim 38 ms → gerçek 400; hata ekranda; yeni jeton alındı.
d) JS dosyaları engelli: teklif gönderimi disabled, URL alan sızdırmıyor; Drone sunucuda süzülmüş = 1.
e) /: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /hakkimizda: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /hizmetler: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /projeler: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /projeler/ilgaz-zirvesi-korkma: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /galeri: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /iletisim: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /teklif-al: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
Ek responsive: 360px, 5 sayfa, taşma yok.
Ek responsive: 430px, 5 sayfa, taşma yok.
Ek responsive: 768px, 5 sayfa, taşma yok.
Ek responsive: 1280px, 5 sayfa, taşma yok.
Hizmet → Teklif al: URL ile hizmet seçili açıldı.
Reduced motion: video yok; CSS hareketler kapalı.
Menü: ESC ve odak iadesi geçti.
Beklenen HTTP red konsol kayıtları (400): 1
JS kapalı senaryosunda bilinçli .js engelleme konsol kayıtları: 0
pageerror + uygulama console.error: 0
SONUÇ: TÜM VİTRİN SENARYOLARI GEÇTİ
```

### Üretim derlemesi

Komut:

```text
node codex/uretim-prova.mjs build
(TEMP kaynak kopyasında: next build --webpack; TZ=UTC)
```

Çıktı:

```text
Prova: ayrı kaynak kopyası; ortak paketler; TZ=UTC; .env kopyalanmadı.
▲ Next.js 16.3.8 (webpack)
✓ Running next.config.ts took 23ms

  Creating an optimized production build ...
✓ Compiled successfully in 2.7s
  Running TypeScript ...
  Finished TypeScript in 2.2s ...
  Collecting page data using 19 workers ...
  Generating static pages using 19 workers (0/24) ...
  Generating static pages using 19 workers (6/24) 
  Generating static pages using 19 workers (12/24) 
  Generating static pages using 19 workers (18/24) 
✓ Generating static pages using 19 workers (24/24) in 451ms
  Finalizing page optimization ...
  Collecting build traces ...

Route (app)
┌ ƒ /
├ ƒ /_not-found
├ ƒ /api/panel/ayarlar
├ ƒ /api/panel/ayarlar/medya/[anahtar]
├ ƒ /api/panel/ben
├ ƒ /api/panel/cikis
├ ƒ /api/panel/fotolar
├ ƒ /api/panel/fotolar/[id]
├ ƒ /api/panel/giris
├ ƒ /api/panel/hizmetler
├ ƒ /api/panel/hizmetler/[id]
├ ƒ /api/panel/kayitlar
├ ƒ /api/panel/markalar
├ ƒ /api/panel/markalar/[id]
├ ƒ /api/panel/markalar/[id]/logo
├ ƒ /api/panel/projeler
├ ƒ /api/panel/projeler/[id]
├ ƒ /api/panel/projeler/[id]/kapak
├ ƒ /api/panel/sifre
├ ƒ /api/panel/siralama
├ ƒ /api/panel/teklifler
├ ƒ /api/panel/teklifler/[id]
├ ƒ /api/teklif
├ ƒ /api/teklif/jeton
├ ƒ /galeri
├ ƒ /hakkimizda
├ ƒ /hizmetler
├ ○ /icon.svg
├ ƒ /iletisim
├ ƒ /projeler
├ ƒ /projeler/[slug]
├ ○ /robots.txt
├ ƒ /sitemap.xml
├ ƒ /teklif-al
└ ƒ /yuklemeler/[dosya]


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

### Üretim sunucusu

Komut:

```text
node codex/uretim-prova.mjs start
(next start -p 3061 -H 127.0.0.1)
```

Çıktı:

```text
Prova üretim BUILD_ID: LF9vrAvjzBMD1Ir8CY88j
▲ Next.js 16.3.8
- Local:         http://127.0.0.1:3061
- Network:       http://127.0.0.1:3061
✓ Ready in 113ms
✓ Running next.config.ts took 31ms
⨯ Error: The destination stream closed early.
    at ignore-listed frames {
  digest: '3584291074'
}
⨯ Error: The destination stream closed early.
    at ignore-listed frames {
  digest: '3584291074'
}
⨯ Error: The destination stream closed early.
    at ignore-listed frames {
  digest: '3584291074'
}
⨯ Error: The destination stream closed early.
    at ignore-listed frames {
  digest: '3584291074'
}
⨯ Error: The destination stream closed early.
    at ignore-listed frames {
  digest: '3584291074'
}
⨯ Error: The destination stream closed early.
    at ignore-listed frames {
  digest: '3584291074'
}
```

### E2E — üretim

Komut:

```text
$env:VITRIN_TEST_URL="http://localhost:3061"
node codex/e2e-vitrin.mjs
```

Çıktı:

```text
DB: yayındaki DRONE sayısı = 1
Yerel test kotası adresi (TEST-NET): 192.0.2.88
a) Menü → Projeler → Drone: 1 kart; detay açıldı; tıklamayla youtube-nocookie iframe oluştu.
Galeri: açılma, yön tuşları, gerçek dokunma kaydırması, ESC, odak iadesi geçti.
b) 3.1 sn bekleme → gerçek POST 201; teşekkür paneli; POST sayısı = 1; DB kayıt artışı = 1.
c) Taze jetonla hızlı gönderim 28 ms → gerçek 400; hata ekranda; yeni jeton alındı.
d) JS dosyaları engelli: teklif gönderimi disabled, URL alan sızdırmıyor; Drone sunucuda süzülmüş = 1.
e) /: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /hakkimizda: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /hizmetler: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /projeler: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /projeler/ilgaz-zirvesi-korkma: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /galeri: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /iletisim: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
e) /teklif-al: scrollWidth=390 <= 390; H1=1; başlık sırası doğru; title var.
Ek responsive: 360px, 5 sayfa, taşma yok.
Ek responsive: 430px, 5 sayfa, taşma yok.
Ek responsive: 768px, 5 sayfa, taşma yok.
Ek responsive: 1280px, 5 sayfa, taşma yok.
Hizmet → Teklif al: URL ile hizmet seçili açıldı.
Reduced motion: video yok; CSS hareketler kapalı.
Menü: ESC ve odak iadesi geçti.
Beklenen HTTP red konsol kayıtları (400): 1
JS kapalı senaryosunda bilinçli .js engelleme konsol kayıtları: 0
pageerror + uygulama console.error: 0
SONUÇ: TÜM VİTRİN SENARYOLARI GEÇTİ
```

### Üretim HTTP, 404 ve hata sunumu

Komut:

```text
node codex/ek-kontrol.mjs
```

Çıktı:

```text
/: HTTP 200; ilk HTML'de H1 + description + OG; donmuş önbellek yok.
/hakkimizda: HTTP 200; ilk HTML'de H1 + description + OG; donmuş önbellek yok.
/hizmetler: HTTP 200; ilk HTML'de H1 + description + OG; donmuş önbellek yok.
/projeler: HTTP 200; ilk HTML'de H1 + description + OG; donmuş önbellek yok.
/galeri: HTTP 200; ilk HTML'de H1 + description + OG; donmuş önbellek yok.
/iletisim: HTTP 200; ilk HTML'de H1 + description + OG; donmuş önbellek yok.
/teklif-al: HTTP 200; ilk HTML'de H1 + description + OG; donmuş önbellek yok.
/olmayan-sayfa: HTTP 404; noindex var. Ekranın gerçek DOM'u aşağıda tarayıcıda denetlenir.
/projeler/olmayan-proje: HTTP 404; noindex var. Ekranın gerçek DOM'u aşağıda tarayıcıda denetlenir.
/olmayan-sayfa: tarayıcıda Türkçe H1 ve teklif bağlantısı görünür; koyu tema + Oswald doğru.
/projeler/olmayan-proje: tarayıcıda Türkçe H1 ve teklif bağlantısı görünür; koyu tema + Oswald doğru.
Geçersiz kategori: Tümü seçili, 8 yayın projesi.
İstemci hata sunumu (400 yanıt benzetimi): mesaj telefon altında; aria-invalid=true.
İstemci hata sunumu (429 yanıt benzetimi): mesaj form üstünde; düğme yeniden etkin.
```

### Mevcut API testleri

Komut:

```text
npm test
(node codex/api-prova.mjs: yerel test parolasını yalnız süreç ortamından geçirir.)
```

Çıktı:

```text

> seker-medya@0.1.0 test
> node tests/test-api.mjs

Hedef: http://localhost:3060

# Giriş
  ✓ yanlış şifre 401
  ✓ oturumsuz /ben 401
  ✓ büyük harf + boşluklu kullanıcı adıyla giriş 200 (normalleştirme)
  ✓ /ben oturumdaki yöneticiyi ve yeni teklif sayısını verir
  ✓ ikinci cihaz giriş 200

# Oturumsuz panel uçları 401
  ✓ 20 panel ucunun hepsi oturumsuz 401

# Ayarlar
  ✓ ayarlar okunur, alan tanımlarıyla
  ✓ telefon + showreel + e-posta kaydı 200
  ✓ telefon normalleştirilmiş saklanır (05321234567)
  ✓ geçersiz telefon 400 + alan adı
  ✓ YouTube/Vimeo olmayan showreel 400
  ✓ firma adı boş bırakılamaz 400
  ✓ bilinmeyen ayar anahtarı 400
  ✓ üst sınırı aşan metin 400
  ✓ ana sayfa derlemede dondurulmamış (her istekte üretilir)
  ✓ ana sayfa telefon bağlantısını +90 ile üretir
  ✓ ana sayfada schema.org verisi var

# Hizmetler
  ✓ listede olmayan ikon 400
  ✓ hizmet eklenir 201
  ✓ hizmet pasifleşir
  ✓ pasif hizmet vitrinde görünmez

# Projeler
  ✓ proje eklenir 201, varsayılan taslak
  ✓ Türkçe başlıktan adres üretilir
  ✓ YouTube bağlantısı kimliğe ayrıştırılır, gömme nocookie
  ✓ aynı başlık → adres -2 ile üretilir
  ✓ elle yazılan çakışan adres 409
  ✓ tanınmayan video bağlantısı 400
  ✓ Vimeo bağlantısı kabul edilir
  ✓ geçersiz kategori 400
  ✓ saçma yıl 400
  ✓ taslak öne çıkan proje vitrinde görünmez
  ✓ proje yayına alınır
  ✓ yayındaki öne çıkan proje vitrinde görünür

# Kapak ve fotoğraf yükleme
  ✓ kapak yüklenir 201, en uzun kenar 2400'e iner
  ✓ kapak /yuklemeler'den image/webp olarak sunulur
  ✓ yüklenen görselde EXIF yok
  ✓ görsel olmayan dosya 400
  ✓ yol geçişi reddedilir (..%2F.…)
  ✓ yol geçişi reddedilir (..%5C.…)
  ✓ izinsiz uzantı 404
  ✓ kapak değiştirilir
  ✓ eski kapak dosyası silinir
  ✓ projeye 3 fotoğraf yüklenir, varsayılan galeride
  ✓ projesiz (yalnız galeri) fotoğraf 201
  ✓ olmayan projeye fotoğraf 404
  ✓ eksik sıralama listesi 400
  ✓ tekrar eden kimlikli sıralama 400
  ✓ tam liste ters sırayla kaydedilir
  ✓ fotoğraflar yeni sırayla döner
  ✓ fotoğraf galeriden çıkarılır

# Açılış videosu (Range)
  ✓ MP4 başlıklı dosya kabul edilir 201
  ✓ Range isteği 206 + Content-Range (Safari şartı)
  ✓ dosya dışı aralık 416
  ✓ aralıksız istek 200 video/mp4 tam boy
  ✓ başlığı video olmayan dosya 400 (uzantıya güvenilmez)
  ✓ bilinmeyen medya anahtarı 404
  ✓ açılış videosu kaldırılır
  ✓ kaldırılan video dosyası da silinir
  ✓ giriş animasyonu (mobil) yüklenir 201
  ✓ giriş animasyonu kaldırılır
  ✓ kaldırılan giriş videosu dosyası da silinir

# Markalar
  ✓ http(s) olmayan marka adresi 400
  ✓ logosuz marka eklenir
  ✓ logo yüklenir, en uzun kenar 800

# Teklif formu (herkese açık)
  ✓ jeton alınır, önbelleğe alınmaz
  ✓ 3 sn dolmadan gönderilen form 400 (bot hızı)
  ✓ imzası bozuk jeton 400
  ✓ uydurma eski jeton 400
  ✓ KVKK onayı yoksa 400
  ✓ geçersiz telefon 400
  ✓ takvimde olmayan tarih 400
  ✓ bal küpü dolu: bota 201 döner
  ✓ bal küpü dolu: kayıt YAZILMAZ
  ✓ geçerli talep 201
  ✓ talep panelde YENI, telefon normalleştirilmiş
  ✓ WhatsApp dönüş bağlantısı hazır mesajlı
  ✓ etkinlik tarihi kaymadan yazılır (5 Aralık)
  ✓ sıfır adetli durumlar da listede
  ✓ talep durumu ve iç notu değişir
  ✓ geçersiz durum 400
  ✓ aynı IP'den saatte 6. talep 429 (bozuk istekler de sayılır)

# Denetim izi
  ✓ denetim izinde giriş, ayar, proje, foto, teklif kayıtları var
  ✓ ayar değişikliği eski → yeni yazılır

# Şifre değişince diğer cihaz düşer
  ✓ yanlış mevcut şifre 400
  ✓ şifre değişir
  ✓ değiştiren cihazın oturumu sürer
  ✓ ikinci cihazın oturumu düşer 401
  ✓ şifre eski hâline döner

# Silme ve temizlik
  ✓ proje silinir
  ✓ projenin fotoğraf kayıtları da gider (Cascade)

90 geçti, 0 kaldı
```

### Paket geri alma doğrulaması

Komut:

```text
node codex/kurtarma-kontrol.mjs
```

Çıktı:

```text
Geri alınan paket dosyaları: 26492; SHA-256 farklı/eksik: 0
```

### Kurulu marka ikonlarının kontrolü

Komut:

```text
node -e "const i=require('lucide-react'); console.log('Kurulu lucide-react sürümü:',require('lucide-react/package.json').version); for(const n of ['Instagram','Youtube','Facebook','Linkedin']) console.log(n+': '+typeof i[n]);"
```

Çıktı:

```text
Kurulu lucide-react sürümü: 1.54.0
Instagram: undefined
Youtube: undefined
Facebook: undefined
Linkedin: undefined
```

## Ekran görüntüleri

Son görüntüler üretim prova sunucusundan, gerçek Chrome ile alındı. İstenen yedi dosya tam sayfadır:

- ../ekran/01-ana-390.png
- ../ekran/01-ana-1440.png
- ../ekran/02-projeler-390.png
- ../ekran/03-proje-detay-1440.png
- ../ekran/04-galeri-acik-390.png
- ../ekran/05-teklif-390.png
- ../ekran/06-menu-acik-390.png

Açık dialog uzun belgenin tam sayfa görüntüsünde geniş siyah alan üretebildiği için ayrıca gerçek ekran alanı:

- ../ekran/04-galeri-viewport-390.png
- ../ekran/06-menu-viewport-390.png

## Yapılamayanlar ve sebebi

- Ham console.error sayısı tamamen sıfır değildir: her E2E turunda bilerek alınan gerçek HTTP 400 için Chrome
  bir kaynak hata kaydı yazar. Bu kayıt ayrıca sayılmıştır. pageerror + uygulama console.error = 0;
  beklenen HTTP 400 kaydı = 1. Hata gizlenerek sıfırmış gibi raporlanmadı.
- Tüm src satır taraması boş değildir: eşzamanlı arka uç düzenlemesinden sonra src/lib/yukleme.ts:108
  151 karakterdir. Benim ön yüz kapsamımda 140 karakteri aşan satır yoktur. Yasaklı dosyaya müdahale edilmedi.
- İçerik rg taraması mevcut src/app/api/panel/ayarlar/route.ts:50 yorumundaki "0532 …" ile eşleşir.
  Ön yüz içerik gömmez; korunan eski yorum silinmedi. Renk taramasının tek eşleşmesi korunması istenen viewport'tur.
- Git deposu görev başında da tüm kaynakları untracked gösteriyordu. Bu yüzden git status çıktısında prisma/tests/tools
  yok şartı sağlanamaz. Başlangıç ve son çıktılar aynen eklendi; commit yaparak bu durum örtülmedi.
- Başlangıç SHA-256 kaydına göre 60 korunan dosyanın beşi görev sırasında dışarıdan değişti:
  src/lib/ayarlar.ts, src/lib/vitrin.ts, src/lib/yukleme.ts,
  src/app/api/panel/ayarlar/medya/[anahtar]/route.ts ve tests/test-api.mjs.
  Dosya saatleri 21:45:18–21:45:44 (İstanbul); değişiklikler giriş animasyonu medya desteği/testleriyle ilgilidir.
  Bu dosyaları düzenlemedim veya geri almadım. Son üretim derlemesine güncel halleri okuma/kopyalama yoluyla dahil edildi.
- Kurulu lucide-react 1.54.0 Instagram/Youtube/Facebook/Linkedin dışa aktarımlarını içermiyor.
  Paket eklemeden kendi küçük SVG marka ikonları kullanıldı; diğer ikonlar lucide-react'tendir.
- Örnek veride açılış videosu yoktur. Gerçek poster ve mobil/reduced-motion ekranı doğrulandı;
  yüklü gerçek açılış videosuyla ağ indirme/saveData kabul testi yapılamadı. Koşul HeroVideo'da yükleme öncesindedir.
- Chrome ekran boyutları test edildi; fiziksel iOS/Safari cihaz testi yapılmadı.

## Arka uçtan beklenen

- Vitrin ve teklif API sözleşmesi bu görev için yeterli; ön yüzü çalıştırmak için yeni uç/şema/paket gerekmiyor.
- Tam src satır denetimini boşaltmak için src/lib/yukleme.ts:108 satırının bölünmesi gerekiyor.
  Tam içerik rg taramasının boş olması istenirse eski API yorumundaki örnek telefonun çıkarılması gerekiyor.
- Eşzamanlı giriş animasyonu değişikliklerini arka uç sahibi kendi denetiminde değerlendirmeli.
  Bu fazda yeni girisVideosu alanı ön yüzde kullanılmaz; açılış bileşeni ileride değiştirilebilir.
- /panel ekranları bu görevin dışındadır. Footer'daki Yönetim bağlantısı sonraki fazın adresine hazırdır.

## Kullanıcıdan beklenen

- Onaylı logo ve yüksek çözünürlüklü açılış posteri; sessiz açılış videosu ve sonradan istenen giriş animasyonu.
- KVKK aydınlatma metni. Formda istenen onay cümlesi var; henüz mevcut olmayan metne bağlantı konmadı.
- Gerçek telefon, e-posta, adres, harita ve sosyal hesapların onayı. Şu an veritabanındaki örnek içerik gösterilir.
- Gerçek marka logoları ve kullanım izni; seed'deki altı uydurma marka canlı içerik olarak onaylanmış sayılmaz.
- Firma tanıtımı, hizmet özetleri, showreel ve yayımlanacak proje/galeri içeriklerinin son onayı.
