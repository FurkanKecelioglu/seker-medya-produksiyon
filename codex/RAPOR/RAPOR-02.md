## Yapılan adımlar

10 Ekim 2026 — CODEX GÖREV 02. Geliştirme ön izlemesi: http://localhost:3060/panel.

- Proje tecrübelerinin istenen bölümleri, PLAN.md, API.md, kararlar, RAPOR-01 ve yerel Next.js belgeleri okundu.
- Panelin giriş, teklifler, projeler/liste/yeni/düzenleme, galeri, hizmetler, markalar, ayarlar,
  işlem kayıtları ve şifre ekranları tamamlandı. /panel tekliflere yönlenir.
  Giriş dışındaki her sunucu sayfası önce sayfaOturumu() çağırır; params Promise olarak çözülür.
- Vitrin zaten (site) route grubundaydı. Panel kendi layout/kabuğunu kullanır; noindex/nofollow taşır.
  Firma adı ve logo ayarlariOku() ile sunucudan gelir. Menü ve panel adresleri menu.ts içindedir.
  Masaüstünde sol menü, mobilde dört sekme ve Diğer çekmecesi var; Siteyi gör yeni sekmede açılır.
- API sarmalayıcısı JSON/FormData, Türkçe ağ hatası ve alan hatası sağlar. Eşzamanlı 401'ler tek yönlendirmedir.
  Girişte hidrasyon kilidi, şifre gösterme, ağ hatasında kilit çözme ve 429 geri sayımı var.
  İşlemlerde ref kilidi çift gönderimi önler. Her form post, her düğme açık type taşır.
- Teklif kartında WhatsApp ve arama ilk aksiyonlardır; durumlar/adetler, kalıcı iç not ve toplam/sayfalama var.
  Dört satırı aşan mesaj gerçek taşma ölçümüyle açılır; kısa çok satırlı mesaj da sessizce kırpılmaz.
  /ben 30 saniyede bir sorgulanır; sayı, başlık ve etkileşimden sonra Web Audio sesi güncellenir.
- Projeler taslak açılır. Kapak, sırayla çoklu fotoğraf yükleme, dosya başına durum/hata,
  açıklama, galeride gösterme, tam ID listesiyle sıralama, yayın ve adını içeren silme onayı var.
  Medya yenilemesi kaydedilmemiş proje metinlerini sıfırlamaz. Galeri aynı fotoğraf bileşenini kullanır.
- Hizmetlerin görsel ikon seçicisi, aktifliği ve sıralaması; markaların logo/aktiflik/sıralaması var.
  Kaydedilen pencere, yenilenen karttan açılan sonraki pencereyi gecikmeli olarak kapatmaz.
- Ayarlar yalnız API alanlar metadata'sından çizilir. Yeni anahtar Diğer'e düşer; yalnız değişen alanlar PATCH edilir.
  Alan hatası, sayaç, ayrılma uyarısı, fotoğraf/video ön izlemesi ve sınırlı accept listeleri var.
  Kayıtlarda mobil kart/masaüstü tablo, süzgeç ve toplam; şifrede eşleşme kontrolü var.
- Modal/çekmece native dialog kullanır. En üst pencere ESC/odak yönetir; kaydırma kilidi sayaçlıdır.
  Odak effect'i yalnız acik'a bağlıdır. Bildirim bileşeni masaüstü içerik ızgarasının dışındadır.
- D01: proje kartları 16:9, merkezden kırpılır. hqdefault.jpg içindeki bantlar aynı Visual üzerinden,
  yüksek öne çıkan kartlarda da oran bozulmadan kırpılır. Tekrarlayan firma adı sayfa başlıklarından kaldırıldı.
  Açılışın ilk 180 px'ine koyu degrade eklendi.
- Paket, arka uç, şema, test ve dağıtım dosyası değiştirilmedi. Doğrudan veritabanı yazımı, commit ve push yapılmadı.
  Test projeleri/hizmetleri/markaları API'den silindi; E2E Panel teklifleri karar 0003 gereği bırakıldı.
  konum_satiri eski değerine döndü. Panel E2E şifreyi gerçekten değiştirmez.
- Chrome kanalında 390×844 ve giriş/teklif/oturum düşmesi 1440×900 koşuldu.
  Ek olarak 360 px ve masaüstü menü/içerik alanı ölçüldü. Kayıtlar kendi kartından doğrulandı;
  yazmalarda waitForResponse ve gerçek HTTP durumları kullanıldı. Playwright tarayıcısı indirilmedi.
- Üretim derlemesi geçici ayrı kaynak kopyasında yapıldı; çalışan dev'in .next dizinine yazılmadı.
  3062 prova sunucusunda son kodla tüm panel turu ve oturumsuz erişim kontrolü yapıldı.

## Kanıt çıktıları

Çıktılar UTF-8 kanıt dosyalarından aşağıya olduğu gibi alınır. rg için çıkış kodu 1,
eşleşme bulunmadığını gösterir. API test çıktısı gerçek npm test çağrısının araç çıktısından kaydedilmiştir.
Mevcut test paketinin şifre senaryosu kendi test şifresini geçici olarak ayarlayıp geri alır;
panel tarayıcı betiği yalnız eşleşmeme ve yanlış eski şifreyi sınar, kalıcı şifre değişikliği yapmaz.

Beklenen 400/401/404 cevapları Chrome'un otomatik kaynak hata satırlarını üretir.
Betik bunları yalnız sınanan belirli URL/durumlarda ayrı sayar; beklenmeyen kaynak hatasını dışlamaz.
Uygulama console.error ve pageerror sayısı ayrıca sıfır olmalıdır. Ham Chrome hata toplamının sıfır
olması, yanlış giriş ve taslak 404 gibi zorunlu olumsuz senaryolarla birlikte mümkün değildir.
API sarmalayıcı testi ağdan bağımsızdır; gerçek oturum düşmesi de tarayıcı turlarında ayrıca sınanır.

TypeScript

```text
$ npx tsc --noEmit

Çıkış kodu: 0
```

Lint

```text
$ npm run lint

> seker-medya@0.1.0 lint
> eslint


Çıkış kodu: 0
```

Kaynak taramaları, Git durumu ve korunan dosyalar

```text
$ rg -n "[ÃÄÅ]" src
Çıkış kodu: 1
$ rg -n "<button(?![^>]*type=)" src --pcre2
Çıkış kodu: 1
$ rg -n "<form(?![^>]*method=)" src --pcre2
Çıkış kodu: 1
$ rg -n "toISOString\(\)\.slice" src --glob "!src/lib/**"
Çıkış kodu: 1
$ rg -n 'accept="image/\*"' src
Çıkış kodu: 1
$ rg -n "fetch\(" src/app/panel src/components/panel
src/components/panel\api.ts:15:    response = await fetch(`/api/panel${yol}`, {
Çıkış kodu: 0
$ rg -n "#[0-9a-fA-F]{3,8}\b" src/app/panel src/components/panel
Çıkış kodu: 1
$ awk 'length > 140 {print FILENAME":"FNR}' $(rg --files src -g "*.tsx" -g "*.ts" -g "*.css" -g "!src/generated/**")
Çıkış kodu: 0
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
Çıkış kodu: 0
$ node codex/panel-taramalar.mjs (başlangıç SHA-256 özetleriyle korunan dosyaları karşılaştırma)
Korunan dosya: 71; farklı: 0; yeni: 0
```

Mevcut arka uç testleri

```text
$ npm test

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

Panel uçtan uca — dev, birinci tur

```text
$ node codex/e2e-panel.mjs
j) /panel/giris: scrollWidth=390 <= 390
POST /giris → 401
POST /giris → 200
a/390) Yanlış giriş mesajı ve doğru giriş → /panel/teklifler; URL’de şifre yok.
b) JS kapalı: düğme disabled, method=post, URL alan sızıntısı yok.
c/390) Vitrin formu POST /api/teklif → 201 (3.1 sn beklendi)
c/390) Kısa ama çok satırlı mesajın devamı açıldı; metin kırpılmıyor.
PATCH /teklifler/47 → 200
PATCH /teklifler/47 → 200
c/390) Talep #47, rozet=20; bağlantılar, sekme adetleri ve kalıcı not doğrulandı.
POST /projeler → 201
d) Taslak /projeler/e2e-proje-1791662535070 → 404
POST /projeler/44/kapak → 201
d) Kapak yüklendi; henüz kaydedilmemiş müşteri alanı korundu.
Fotoğraf istek sırası: POST → 201 → POST → 201
POST /fotolar → 201
POST /fotolar → 201
PUT /siralama → 200
d) Birlikte seçilen 2 fotoğraf: 2 ayrı POST 201; ikinci fotoğraf artık ilk sırada.
j) /panel/projeler/44: scrollWidth=390 <= 390
PATCH /projeler/44 → 200
d) Yayında /projeler/e2e-proje-1791662535070 → 200, başlık proje H1’inde doğrulandı.
DELETE /projeler/44 → 200
d) DELETE 200; proje listede yok; vitrin tekrar 404.
PATCH /ayarlar → 200
e) PATCH gövdesi: {"konum_satiri":"E2E Konum"}
PATCH /ayarlar → 200
e) Ana sayfa konumu değişti ve eski değerine döndü.
POST /hizmetler → 201
PATCH /hizmetler/30 → 200
DELETE /hizmetler/30 → 200
f) Hizmet kendi kartında; pasif vitrinde yok → aktif var → onaylı silme sonrası yok.
POST /markalar → 201
PATCH /markalar/26 → 200
DELETE /markalar/26 → 200
g) Logolu marka kendi kartında ve vitrinde var; pasif vitrinde yok; onaylı silindi.
POST /sifre → 400
i) Eşleşmeyen şifre: istek=0; yanlış eski şifre POST 400; gerçek şifre değiştirilmedi.
j) /panel/teklifler: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/teklifler: scrollWidth=360 <= 360
j) /panel/projeler: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/projeler: scrollWidth=360 <= 360
j) /panel/projeler/yeni: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/projeler/yeni: scrollWidth=360 <= 360
j) /panel/galeri: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/galeri: scrollWidth=360 <= 360
j) /panel/hizmetler: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/hizmetler: scrollWidth=360 <= 360
j) /panel/markalar: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/markalar: scrollWidth=360 <= 360
j) /panel/ayarlar: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/ayarlar: scrollWidth=360 <= 360
j) /panel/kayitlar: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/kayitlar: scrollWidth=360 <= 360
j) /panel/sifre: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/sifre: scrollWidth=360 <= 360
k) Panel: üst bölüm/WhatsApp=0; vitrin: üst bölüm=1, WhatsApp=1. Çekmece odak ve ESC geçti.
D01) 16:9 proje kartları, firma adı tekrarının kaldırılması ve açılış üst degradenin ekranları alındı.
GET /teklifler?durum=YENI&sayfa=1 → 401
h/390) Çerezler silindi; 401 → giriş yönlendirmesi = 1
j) /panel/giris: scrollWidth=1440 <= 1440
POST /giris → 401
POST /giris → 200
a/1440) Yanlış giriş ve doğru giriş doğrulandı.
c/1440) Vitrin formu POST /api/teklif → 201 (3.1 sn beklendi)
c/1440) Kısa ama çok satırlı mesajın devamı açıldı; metin kırpılmıyor.
PATCH /teklifler/48 → 200
PATCH /teklifler/48 → 200
c/1440) Talep #48, rozet=20; bağlantılar, sekme adetleri ve kalıcı not doğrulandı.
GET /teklifler?durum=YENI&sayfa=1 → 401
h/1440) Çerezler silindi; 401 → giriş yönlendirmesi = 1
Beklenen olumsuz HTTP senaryolarının Chrome kaynak hata kayıtları: 15
pageerror + uygulama console.error: 0
SONUÇ: TÜM PANEL SENARYOLARI GEÇTİ

Çıkış kodu: 0
```

Panel uçtan uca — dev, ikinci tur

```text
$ node codex/e2e-panel.mjs
j) /panel/giris: scrollWidth=390 <= 390
POST /giris → 401
POST /giris → 200
a/390) Yanlış giriş mesajı ve doğru giriş → /panel/teklifler; URL’de şifre yok.
b) JS kapalı: düğme disabled, method=post, URL alan sızıntısı yok.
c/390) Vitrin formu POST /api/teklif → 201 (3.1 sn beklendi)
c/390) Kısa ama çok satırlı mesajın devamı açıldı; metin kırpılmıyor.
PATCH /teklifler/49 → 200
PATCH /teklifler/49 → 200
c/390) Talep #49, rozet=20; bağlantılar, sekme adetleri ve kalıcı not doğrulandı.
POST /projeler → 201
d) Taslak /projeler/e2e-proje-1791662729932 → 404
POST /projeler/45/kapak → 201
d) Kapak yüklendi; henüz kaydedilmemiş müşteri alanı korundu.
Fotoğraf istek sırası: POST → 201 → POST → 201
POST /fotolar → 201
POST /fotolar → 201
PUT /siralama → 200
d) Birlikte seçilen 2 fotoğraf: 2 ayrı POST 201; ikinci fotoğraf artık ilk sırada.
j) /panel/projeler/45: scrollWidth=390 <= 390
PATCH /projeler/45 → 200
d) Yayında /projeler/e2e-proje-1791662729932 → 200, başlık proje H1’inde doğrulandı.
DELETE /projeler/45 → 200
d) DELETE 200; proje listede yok; vitrin tekrar 404.
PATCH /ayarlar → 200
e) PATCH gövdesi: {"konum_satiri":"E2E Konum"}
PATCH /ayarlar → 200
e) Ana sayfa konumu değişti ve eski değerine döndü.
POST /hizmetler → 201
PATCH /hizmetler/31 → 200
DELETE /hizmetler/31 → 200
f) Hizmet kendi kartında; pasif vitrinde yok → aktif var → onaylı silme sonrası yok.
POST /markalar → 201
PATCH /markalar/27 → 200
DELETE /markalar/27 → 200
g) Logolu marka kendi kartında ve vitrinde var; pasif vitrinde yok; onaylı silindi.
POST /sifre → 400
i) Eşleşmeyen şifre: istek=0; yanlış eski şifre POST 400; gerçek şifre değiştirilmedi.
j) /panel/teklifler: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/teklifler: scrollWidth=360 <= 360
j) /panel/projeler: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/projeler: scrollWidth=360 <= 360
j) /panel/projeler/yeni: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/projeler/yeni: scrollWidth=360 <= 360
j) /panel/galeri: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/galeri: scrollWidth=360 <= 360
j) /panel/hizmetler: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/hizmetler: scrollWidth=360 <= 360
j) /panel/markalar: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/markalar: scrollWidth=360 <= 360
j) /panel/ayarlar: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/ayarlar: scrollWidth=360 <= 360
j) /panel/kayitlar: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/kayitlar: scrollWidth=360 <= 360
j) /panel/sifre: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/sifre: scrollWidth=360 <= 360
k) Panel: üst bölüm/WhatsApp=0; vitrin: üst bölüm=1, WhatsApp=1. Çekmece odak ve ESC geçti.
D01) 16:9 proje kartları, firma adı tekrarının kaldırılması ve açılış üst degradenin ekranları alındı.
GET /teklifler?durum=YENI&sayfa=1 → 401
h/390) Çerezler silindi; 401 → giriş yönlendirmesi = 1
j) /panel/giris: scrollWidth=1440 <= 1440
POST /giris → 401
POST /giris → 200
a/1440) Yanlış giriş ve doğru giriş doğrulandı.
c/1440) Vitrin formu POST /api/teklif → 201 (3.1 sn beklendi)
c/1440) Kısa ama çok satırlı mesajın devamı açıldı; metin kırpılmıyor.
PATCH /teklifler/50 → 200
PATCH /teklifler/50 → 200
c/1440) Talep #50, rozet=20; bağlantılar, sekme adetleri ve kalıcı not doğrulandı.
GET /teklifler?durum=YENI&sayfa=1 → 401
h/1440) Çerezler silindi; 401 → giriş yönlendirmesi = 1
Beklenen olumsuz HTTP senaryolarının Chrome kaynak hata kayıtları: 15
pageerror + uygulama console.error: 0
SONUÇ: TÜM PANEL SENARYOLARI GEÇTİ

Çıkış kodu: 0
```

Vitrin uçtan uca — dev

```text
$ node codex/e2e-vitrin.mjs
DB: yayındaki DRONE sayısı = 1
Yerel test kotası adresi (TEST-NET): 192.0.2.80
a) Menü → Projeler → Drone: 1 kart; detay açıldı; tıklamayla youtube-nocookie iframe oluştu.
Galeri: açılma, yön tuşları, gerçek dokunma kaydırması, ESC, odak iadesi geçti.
b) 3.1 sn bekleme → gerçek POST 201; teşekkür paneli; POST sayısı = 1; DB kayıt artışı = 1.
c) Taze jetonla hızlı gönderim 34 ms → gerçek 400; hata ekranda; yeni jeton alındı.
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

Çıkış kodu: 0
```

Üretim derlemesi — dev dizininden ayrı kopya

```text
$ node codex/uretim-panel-prova.mjs build
Prova: ayrı kaynak kopyası; ortak paketler; TZ=UTC; .env kopyalanmadı.
▲ Next.js 16.3.8 (webpack)
✓ Running next.config.ts took 24ms

  Creating an optimized production build ...
✓ Compiled successfully in 2.2s
  Running TypeScript ...
  Finished TypeScript in 2.0s ...
  Collecting page data using 19 workers ...
  Generating static pages using 19 workers (0/36) ...
  Generating static pages using 19 workers (9/36) 
  Generating static pages using 19 workers (18/36) 
  Generating static pages using 19 workers (27/36) 
✓ Generating static pages using 19 workers (36/36) in 475ms
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
├ ƒ /giris-deneme
├ ƒ /hakkimizda
├ ƒ /hizmetler
├ ○ /icon.svg
├ ƒ /iletisim
├ ƒ /panel
├ ƒ /panel/ayarlar
├ ƒ /panel/galeri
├ ƒ /panel/giris
├ ƒ /panel/hizmetler
├ ƒ /panel/kayitlar
├ ƒ /panel/markalar
├ ƒ /panel/projeler
├ ƒ /panel/projeler/[id]
├ ƒ /panel/projeler/yeni
├ ƒ /panel/sifre
├ ƒ /panel/teklifler
├ ƒ /projeler
├ ƒ /projeler/[slug]
├ ○ /robots.txt
├ ƒ /sitemap.xml
├ ƒ /teklif-al
└ ƒ /yuklemeler/[dosya]


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


Çıkış kodu: 0
```

Üretimde oturum koruması ve ilk HTML

```text
$ node codex/panel-uretim-okuma.mjs
/panel: oturumsuz HTTP 307 → /panel/giris
/panel/teklifler: oturumsuz HTTP 307 → /panel/giris
/panel/projeler: oturumsuz HTTP 307 → /panel/giris
/panel/ayarlar: oturumsuz HTTP 307 → /panel/giris
/panel/giris: HTTP 200; noindex/nofollow; ilk HTML’de method=post ve disabled gönderim.
```

Panel uçtan uca — üretim

```text
$ PANEL_TEST_URL=http://localhost:3062 node codex/e2e-panel.mjs
j) /panel/giris: scrollWidth=390 <= 390
POST /giris → 401
POST /giris → 200
a/390) Yanlış giriş mesajı ve doğru giriş → /panel/teklifler; URL’de şifre yok.
b) JS kapalı: düğme disabled, method=post, URL alan sızıntısı yok.
c/390) Vitrin formu POST /api/teklif → 201 (3.1 sn beklendi)
c/390) Kısa ama çok satırlı mesajın devamı açıldı; metin kırpılmıyor.
PATCH /teklifler/51 → 200
PATCH /teklifler/51 → 200
c/390) Talep #51, rozet=20; bağlantılar, sekme adetleri ve kalıcı not doğrulandı.
POST /projeler → 201
d) Taslak /projeler/e2e-proje-1791662942058 → 404
POST /projeler/46/kapak → 201
d) Kapak yüklendi; henüz kaydedilmemiş müşteri alanı korundu.
Fotoğraf istek sırası: POST → 201 → POST → 201
POST /fotolar → 201
POST /fotolar → 201
PUT /siralama → 200
d) Birlikte seçilen 2 fotoğraf: 2 ayrı POST 201; ikinci fotoğraf artık ilk sırada.
j) /panel/projeler/46: scrollWidth=390 <= 390
PATCH /projeler/46 → 200
d) Yayında /projeler/e2e-proje-1791662942058 → 200, başlık proje H1’inde doğrulandı.
DELETE /projeler/46 → 200
d) DELETE 200; proje listede yok; vitrin tekrar 404.
PATCH /ayarlar → 200
e) PATCH gövdesi: {"konum_satiri":"E2E Konum"}
PATCH /ayarlar → 200
e) Ana sayfa konumu değişti ve eski değerine döndü.
POST /hizmetler → 201
PATCH /hizmetler/32 → 200
DELETE /hizmetler/32 → 200
f) Hizmet kendi kartında; pasif vitrinde yok → aktif var → onaylı silme sonrası yok.
POST /markalar → 201
PATCH /markalar/28 → 200
DELETE /markalar/28 → 200
g) Logolu marka kendi kartında ve vitrinde var; pasif vitrinde yok; onaylı silindi.
POST /sifre → 400
i) Eşleşmeyen şifre: istek=0; yanlış eski şifre POST 400; gerçek şifre değiştirilmedi.
j) /panel/teklifler: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/teklifler: scrollWidth=360 <= 360
j) /panel/projeler: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/projeler: scrollWidth=360 <= 360
j) /panel/projeler/yeni: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/projeler/yeni: scrollWidth=360 <= 360
j) /panel/galeri: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/galeri: scrollWidth=360 <= 360
j) /panel/hizmetler: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/hizmetler: scrollWidth=360 <= 360
j) /panel/markalar: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/markalar: scrollWidth=360 <= 360
j) /panel/ayarlar: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/ayarlar: scrollWidth=360 <= 360
j) /panel/kayitlar: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/kayitlar: scrollWidth=360 <= 360
j) /panel/sifre: scrollWidth=390 <= 390; vitrin kabuğu=0
Ek mobil) /panel/sifre: scrollWidth=360 <= 360
k) Panel: üst bölüm/WhatsApp=0; vitrin: üst bölüm=1, WhatsApp=1. Çekmece odak ve ESC geçti.
D01) 16:9 proje kartları, firma adı tekrarının kaldırılması ve açılış üst degradenin ekranları alındı.
GET /teklifler?durum=YENI&sayfa=1 → 401
h/390) Çerezler silindi; 401 → giriş yönlendirmesi = 1
j) /panel/giris: scrollWidth=1440 <= 1440
POST /giris → 401
POST /giris → 200
a/1440) Yanlış giriş ve doğru giriş doğrulandı.
c/1440) Vitrin formu POST /api/teklif → 201 (3.1 sn beklendi)
c/1440) Kısa ama çok satırlı mesajın devamı açıldı; metin kırpılmıyor.
PATCH /teklifler/52 → 200
PATCH /teklifler/52 → 200
c/1440) Talep #52, rozet=20; bağlantılar, sekme adetleri ve kalıcı not doğrulandı.
GET /teklifler?durum=YENI&sayfa=1 → 401
h/1440) Çerezler silindi; 401 → giriş yönlendirmesi = 1
Beklenen olumsuz HTTP senaryolarının Chrome kaynak hata kayıtları: 11
pageerror + uygulama console.error: 0
SONUÇ: TÜM PANEL SENARYOLARI GEÇTİ

Çıkış kodu: 0
```

API sarmalayıcısı — yalıtılmış davranış testi

```text
$ node codex/panel-api-kontrol.mjs
API sarmalayıcısı: eşzamanlı 5 adet 401 → 1 yönlendirme, 5 Türkçe hata.
API sarmalayıcısı: ağ kopması Türkçe mesaja dönüştü.
API sarmalayıcısı: FormData korunur; multipart sınırını tarayıcı üretir.

Çıkış kodu: 0
```

Rapor/betik/günlüklerde şifre bulunmadığının kontrolü

```text
$ node codex/panel-sir-kontrol.mjs
Kontrol edilen metin dosyası: 64; şifre içeren: 0
```

## Ekran görüntüleri

Son üretim tarayıcı turundan; giriş ekranı şifre girilmeden çekilir.

- [10-giris-390.png](../ekran/10-giris-390.png) — 22491 bayt
- [11-teklifler-390.png](../ekran/11-teklifler-390.png) — 54365 bayt
- [12-teklifler-1440.png](../ekran/12-teklifler-1440.png) — 106650 bayt
- [13-proje-duzenle-1440.png](../ekran/13-proje-duzenle-1440.png) — 207991 bayt
- [14-proje-yukleme-390.png](../ekran/14-proje-yukleme-390.png) — 47000 bayt
- [15-ayarlar-1440.png](../ekran/15-ayarlar-1440.png) — 1292457 bayt
- [16-ayarlar-390.png](../ekran/16-ayarlar-390.png) — 781582 bayt
- [17-menu-diger-390.png](../ekran/17-menu-diger-390.png) — 23384 bayt
- [18-kayitlar-390.png](../ekran/18-kayitlar-390.png) — 43729 bayt
- [19-sil-onay-390.png](../ekran/19-sil-onay-390.png) — 24282 bayt
- [03b-projeler-1440.png](../ekran/03b-projeler-1440.png) — 471424 bayt
- [01b-ana-ilk-ekran-1440.png](../ekran/01b-ana-ilk-ekran-1440.png) — 987368 bayt
- [01b-ana-ilk-ekran-390.png](../ekran/01b-ana-ilk-ekran-390.png) — 266703 bayt

## Yapılamayanlar ve sebebi

- İstenen ekranlar ve son doğrulama turları tamamlandı. Git durumunun korunan klasörleri hiç göstermemesi
  mevcut depoda sağlanamaz: görev başında bütün proje untracked idi; ham çıktı yukarıdadır.
  Git'e dosya ekleyip durumu değiştirmedim. Başlangıç SHA-256 kaydıyla 71 korunan dosya aynı,
  farklı dosya 0, yeni dosya 0. Başlangıç kaydı: codex/kanit/02-korunan-once.json.
- Ara turlarda bulunan modal kapanış yarışı ve masaüstü ızgara hatası düzeltildi; son turlar yeniden koşuldu.
  Ara bir dev turunda React bağlanma uyarısı görüldü; konsol filtresiyle gizlenmedi.
  Son iki dev turu ve üretim turundaki uygulama hata sayıları ham çıktılarda ayrıca gösterilir.
  Bir ara turda dev sunucusu cevap vermeyi bıraktı; yalnız bu projeye ait doğrulanmış dev süreçleri yeniden başlatıldı.
  Tarayıcı hata izinde otomatik yazılan test oturum çerezi günlüklerden maskelendi;
  betiğin hata yazıcısı aynı bilginin tekrar dökülmesini önleyecek biçimde düzeltildi.
  Bu görev şifreyi yazdırmadı. Son sır kontrolünde önceki Görev 01 günlüğünde bulunan şifre değeri de
  yalnız aynı uzunlukta maske baytlarıyla değiştirildi; günlüğün diğer baytları ve olayları korunur.
- Görev sırasında başka çalışma tarafından eklenen giris-deneme ve components/site/giris dosyaları
  bu teslimin değişikliği değildir; dokunulmadı. Derleme çıktısı mevcut kaynak ağacını olduğu gibi içerir.
- Yanlış giriş/404 senaryolarındaki tarayıcı HTTP kaynak hataları yukarıda ayrı sayılmıştır;
  uygulama hatası sıfır koşulu gevşetilmemiştir.

## Arka uçtan beklenen

Bu faz için ek uç veya şema değişikliği gerekmiyor; mevcut API sözleşmesi kullanıldı.

## Kullanıcıdan beklenen

Bu görev için ek bilgi veya işlem gerekmiyor. İnceleme için panel, rapor ve ekranlar hazır.
