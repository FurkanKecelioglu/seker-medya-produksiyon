# CODEX GÖREV 02 — Yönetim paneli (`/panel`)

> **Tek fazlık görev.** Vitrine (Görev 01) yalnız bu metinde açıkça yazılan yerde dokun (§1 "kabuk ayrımı").
> Çıktın Claude tarafından satır satır denetlenecek ve tarayıcıda tıklanarak doğrulanacak.

## 0. Önce oku

1. `C:\Users\HP\.claude\PROJE-TECRUBELERI.md` — §7.3 (kullanıcı tarafı: 13 giriş düğmesi asılı kalması, 14 tek seferlik
   401 yönlendirmesi), §7.5/24 (düğme `type`), **§7.6 33–40 hepsini oku** (modal/çekmece kusurları), §7.16 (sessiz kırpma,
   toplam), §7.21/119-120 (testin kendini kandırması), §7.24/137-138, §7.28/158 (HEIC, `accept`), §9.3, §14 (panel
   tasarım dili: menü tek dosyada, durum renkleri ayrı simge).
2. `notlar/API.md` — **Panel** ve **Yüklenen dosyalar** bölümleri sözleşmedir. Uç yoksa/yetersizse uydurma,
   `## Arka uçtan beklenen` altına yaz.
3. `notlar/kararlar/` — özellikle 0003 (her şey panelden, tek rol, proje taslak açılır, galeri = `Foto.galeride`,
   teklif silinmez) ve 0004 (teklif durumu, bildirim şimdilik yalnız rozet).
4. Görev 01'de kurduğun tasarım sistemi (`globals.css` simgeleri, ortak bileşenler) ve `codex/RAPOR/RAPOR-01.md`.
5. Next.js 16: `node_modules/next/dist/docs/` (route group, `params` Promise, `redirect`).

## 1. Sınırlar

**Senin alanın:** `src/app/panel/**`, `src/components/panel/**`, `globals.css` (yalnız panel simgeleri/sınıfları eklemek),
ortak bileşenler (davranışını bozmadan).

**Kabuk ayrımı (zorunlu):** panel sitenin üst bölümünü, alt bölümünü, sabit WhatsApp düğmesini, açılış animasyonunu
**göstermez**. Görev 01'de bunlar kök `src/app/layout.tsx`'e konduysa `src/app/(site)/layout.tsx`'e taşı; kök layout'ta
yalnız `<html>`, `<body>`, fontlar ve `generateMetadata`/`viewport` kalır. Panelin kendi `src/app/panel/layout.tsx`'i var.
Panel sayfaları arama motoruna kapalı: panel layout'unda `metadata.robots = { index: false, follow: false }`.

**DOKUNMA:** `prisma/**`, `src/lib/**`, `src/app/api/**`, `src/app/yuklemeler/**`, `robots.ts`, `sitemap.ts`,
`src/generated/**`, `tools/**`, `tests/**`, `dagitim/**`, `.env`, `package.json` (paket ekleme — gerekirse raporuna yaz).
Git commit/push yok.

`@/lib`'den **yalnız şunları** istemci bileşenine içe aktarabilirsin (içlerinde prisma yok): `@/lib/kategoriler`
(`KATEGORILER`, `HIZMET_IKONLARI`, `TEKLIF_DURUMLARI`, `kategoriAdi`). Sunucu bileşeninde ayrıca `sayfaOturumu`
(`@/lib/guard`) ve `ayarlariOku` (`@/lib/ayarlar`, firma adı/logo için). Veri okuma/yazma **API üzerinden**.

Her panel sayfası sunucu bileşeninde en üstte `await sayfaOturumu()` çağırır — giriş sayfası hariç.

## 2. Kullanım bağlamı — tasarımı bu belirler

- Paneli **firma sahibi** kullanacak: bilgisayar başında proje/metin girer, **telefonda** teklif taleplerine bakar ve
  müşteriyi arar/WhatsApp'lar. Teknik biri değil. Her şey 360 px'te de rahat; dokunma hedefi ≥ 44 px.
- En sık iki iş: (1) **yeni teklif talebini görüp müşteriye dönmek** (2 dokunuşu geçmesin: talep → "WhatsApp'tan yaz"
  ya da "Ara"); (2) **yeni proje eklemek** (başlık + kategori + YouTube bağlantısı + kapak → yayına al).
- Tema vitrinle aynı aile (koyu + kırmızı) ama **okunurluk önce gelir**: kartların sınırı belirgin, girdi kutularının
  zemini karttan farklı (rehber §7.6/39), metin en az 15 px. Kırmızı = marka/birincil aksiyon. **Durum renkleri
  kırmızıdan ayrı simgeler** (`--durum-yeni`, `--durum-arandi` … ve açık tonları); "Kapandı" gri. Rozet = renk + metin.
- Tehlikeli işlem (sil) kırmızı birincil düğme gibi görünmez: ikincil, onay penceresiyle.

## 3. Kabuk ve menü

- Menü tanımı **tek dosyada**: `src/components/panel/menu.ts` → `{ yol, etiket, ikon, rozet? }`. Adres elle başka yerde
  yazılmaz. Masaüstünde sol menü (rehber §14.2 deseni: koyu zemin, üstte logo/firma adı, kalem başına ikon, aktif
  kalem belirgin, altta kullanıcı adı + Çıkış). Mobilde alt sekme çubuğu (en çok 5: **Teklifler, Projeler, Galeri,
  Ayarlar, Diğer**) + "Diğer" çekmecesi (Hizmetler, Markalar, İşlem kayıtları, Şifre, Siteyi gör, Çıkış).
- Firma adı/logo sunucu layout'unda `ayarlariOku()` ile okunur, kabuğa prop geçer (koda gömülmez).
- "Siteyi gör" bağlantısı yeni sekmede `/`.
- **Yeni teklif rozeti:** `GET /api/panel/ben` → `yeniTeklif`. Panel açıkken 30 sn'de bir; sekme gizliyken de.
  Sayı artarsa `document.title` başına "(N)" ve menüde rozet; kısa bir ses (Web Audio ile üretilen bip — dosya yok;
  tarayıcı ilk etkileşimden önce sesi engellerse ekranı bozmadan geç ama `console.error` basma).

## 4. Ekranlar

1. **`/panel/giris`** — kullanıcı adı (`type="text"`, `autoCapitalize="none"`, `autoCorrect="off"`,
   `autoComplete="username"`), şifre (göster/gizle düğmesi, `autoComplete="current-password"`). `<form method="post">`,
   düğme hidrasyona kadar `disabled`. İstek `try/catch` içinde — ağ hatasında düğme "Giriş yapılıyor…"da asılı kalmasın.
   401 → API'nin mesajı; 429 → `tekrarSn`'den geri sayım ("N sn sonra tekrar deneyin"), sayım bitince düğme açılır.
   Başarılıysa `/panel`. Oturum zaten açıksa `/panel/giris` → `/panel`.
2. **`/panel` → `/panel/teklifler`'e yönlenir** (ana ekran teklifler).
3. **`/panel/teklifler`** — durum sekmeleri (`durumlar`: ad + adet; sıfırlar da görünür), varsayılan "Yeni".
   Her talep bir kart: ad, `olusturmaMetni`, hizmet, `etkinlikTarihiMetni`, firma, e-posta (`mailto:`), mesaj
   (uzunsa 4 satır + "devamı"), durum rozeti. Kartta **büyük iki düğme**: "WhatsApp'tan yaz" (`whatsappLinki`,
   `target="_blank" rel="noopener"`) ve "Ara" (`telefonLinki`). Durum değiştirici (5 durum) → `PATCH` → rozet ve sekme
   sayıları güncellenir (listeyi yeniden çek). **İç not**: çok satırlı kutu + "Notu kaydet" (değişmediyse kapalı).
   Sayfalama: `toplam` görünür ("142 talep · sayfa 2/5"), önceki/sonraki. Boş sekmede düzgün bir boş alan.
4. **`/panel/projeler`** — liste (kapak küçük resmi, başlık, kategori, yıl, **Taslak/Yayında** rozeti, "Öne çıkan"
   işareti). Üstte "Yeni proje". Sıra: yukarı/aşağı düğmeleri (sürükle-bırak paketi yok) → `PUT /siralama` listenin
   **tamamıyla**. Öne çıkan sayısı `oneCikanSiniri`'ni aşarsa listenin üstünde görünür uyarı ("Sitede yalnız ilk 6
   gösterilir").
5. **`/panel/projeler/yeni`** ve **`/panel/projeler/[id]`** — form: başlık*, kategori* (`KATEGORILER`), özet*,
   müşteri, yıl, açıklama (çok satırlı; "paragrafları boş satırla ayırın"), video bağlantısı (YouTube/Vimeo; yanında
   "YouTube'da Paylaş → bağlantıyı kopyala" yardımı; `""` göndermek videoyu kaldırır), adres (slug — boşsa sunucu
   üretir; 409'da alanın altında mesaj), öne çıkan, yayında. Yeni proje **taslak** açılır; kaydedince düzenleme
   sayfasına geçilir. Düzenleme sayfasında ayrıca:
   - **Kapak**: önizleme + yükle/değiştir/kaldır. Kapak yoksa ve video varsa "YouTube küçük resmi kullanılıyor" notu.
   - **Fotoğraflar**: çoklu seçim, **dosyalar sırayla tek tek** gönderilir, her birinin durumu listede
     (bekliyor / yükleniyor / tamam / hata + sebep); toplam sayı; açıklama düzenle; "galeride göster" anahtarı;
     sırala (yukarı/aşağı → `PUT /siralama` `tur: "foto"`, o projenin tümü); sil (onaylı).
   - "Sitede gör" (yayındaysa `/projeler/<slug>`, yeni sekme). **Sil**: onay penceresinde proje adı ve "fotoğraflarıyla
     birlikte silinir, geri alınamaz" yazısı.
6. **`/panel/galeri`** — projesiz galeri fotoğrafları (`GET /fotolar?proje=galeri`): aynı çoklu yükleme bileşeni,
   ızgara, açıklama, sırala, sil. Toplam sayı görünür.
7. **`/panel/hizmetler`** — liste (pasifler soluk + "Pasif" rozeti), ekle/düzenle (başlık, özet, ikon — `HIZMET_IKONLARI`
   ikonlarıyla görsel seçici, aktif), sırala, sil (onaylı).
8. **`/panel/markalar`** — liste (logo, ad, bağlantı, aktif), ekle (ad*, url, logo), logo değiştir/kaldır, aktif
   anahtarı, sırala, sil (onaylı).
9. **`/panel/ayarlar`** — **form `GET /ayarlar` cevabındaki `alanlar`dan çizilir** (anahtar listesi koda yazılmaz).
   Gruplama için panelde tek bir eşleme tablosu olabilir (`{ anahtar → grup }`: Firma, Açılış, Ana sayfa metinleri,
   İletişim, Sosyal medya, Arama motoru); tabloda olmayan yeni anahtar "Diğer" grubuna düşer, kaybolmaz.
   `enUzun > 200` → çok satırlı kutu; karakter sayacı (`412 / 600`). Kaydet yalnız **değişen** alanları `PATCH`'ler;
   400 `alan` → o kutunun altında. Kaydedilmemiş değişiklik varken sayfadan ayrılırken uyar (`beforeunload`).
   **Medya alanları** (`alanlar.medya`): önizleme (video için `<video controls muted>`), yükle/değiştir/kaldır;
   sınır yazısı (fotoğraf 20 MB, video 25 MB); `accept` API.md'deki gibi — **`image/*` YAZMA**. Yükleme sırasında
   ilerleme ya da en azından "yükleniyor…" ve düğme kilitli.
10. **`/panel/kayitlar`** — işlem kayıtları (masaüstünde tablo, mobilde kart), eylem süzgeci, sayfalama,
    **toplam** görünür. Tarih/saat API'nin verdiği metinle.
11. **`/panel/sifre`** — eski, yeni (en az 10), yeni tekrar. Eşleşmiyorsa **istek atılmaz**, alan altında mesaj.
    Başarıda "Şifreniz değişti; diğer cihazlardaki oturumlar kapandı."

## 5. Davranış kuralları

- **İstemci sarmalayıcı** `src/components/panel/api.ts`: JSON ve `FormData` gönderir, hata gövdesinden `{hata, alan}`
  çıkarır, **401'de tek seferlik** `/panel/giris` yönlendirmesi (aynı anda 5 istek 401 alırsa tek yönlendirme — kilit
  değişkeni). Ağ hatasını da Türkçe mesaja çevirir. Hiçbir yerde `fetch` bu sarmalayıcı dışında çağrılmaz
  (kanıt §6.4).
- Her form `<form method="post">`, gönder düğmesi `type="submit"` ve hidrasyona kadar `disabled`; gönderirken kilitli,
  çift tıklama tek istek. Başarıda kısa bildirim (`sonner` kurulu). Hata alanın altında ya da formun üstünde.
- Modal/çekmece: ESC ve odak tuzağı yalnız **en üstteki** pencerede; kaydırma kilidi **sayaçlı**; odak effect'inin
  bağımlılığı yalnız `acik` (callback ref'te) — rehber §7.6/35-36. Pencere içindeki forma yazarken imleç kaçmamalı.
- Silme dahil her işlemden sonra liste **sunucudan yeniden** çekilir ya da cevaptaki kayıtla güncellenir; ekrandaki
  sayı ile sunucudaki aynı kalır.
- Tarih: istemcide `toISOString().slice(0,10)` YASAK. Gösterim API'nin hazır metinleriyle.
- Görseller: `/yuklemeler/...` adresleri `next/image` ile (küçük resim `sizes` doğru) ya da düz `<img>` +
  `loading="lazy"` + `width/height` — kırık ikon görünmesin, yer tutucu çiz.
- Kod yorumları Türkçe ve "neden"i anlatır. `src/` içinde 140 karakteri aşan satır yok.

## 6. KANIT — her biri rapora komut + çıktı olarak yapıştırılır. Çıktısı yapıştırılmayan adım yapılmamış sayılır.

Dev açık: `http://localhost:3060`. Giriş: `yonetici` / `.env`'deki `SEED_SIFRE_YONETICI` — betik `.env`'den okusun,
**şifre rapora, log'a, ekran görüntüsüne yazılmaz**.

1. `npx tsc --noEmit` boş · `npm run lint` hatasız.
2. `rg -n "[ÃÄÅ]" src` boş · `rg -n "<button(?![^>]*type=)" src --pcre2` boş · `rg -n "<form(?![^>]*method=)" src --pcre2` boş.
3. `rg -n "toISOString\(\)\.slice" src --glob "!src/lib/**"` boş · `rg -n 'accept="image/\*"' src` boş.
4. `rg -n "fetch\(" src/app/panel src/components/panel` → yalnız `src/components/panel/api.ts`.
5. `rg -n "#[0-9a-fA-F]{3,8}\b" src/app/panel src/components/panel` boş.
6. `awk 'length > 140 {print FILENAME":"FNR}' $(rg --files src -g "*.tsx" -g "*.ts" -g "*.css" -g "!src/generated/**")` boş.
7. `npm test` (dev açıkken) → **90 geçti, 0 kaldı** — arka ucu bozmadığının kanıtı.
8. **Uçtan uca** `codex/e2e-panel.mjs` (Playwright, `chromium.launch({ channel: "chrome" })`, `npx playwright install`
   ÇALIŞTIRMA). Her yazma işleminde ağ isteğini `waitForResponse` ile yakala ve durum kodunu yaz; kaydın göründüğünü
   **kaydın kendi öğesinden** doğrula (başarı mesajındaki metinden değil — rehber §7.21/119). **390×844**'te koş;
   a, c, h adımlarını 1440×900'de de koş. İki kez koştur, iki çıktıyı da yapıştır.
   a. **Giriş:** yanlış şifre → mesaj görünür, URL'de `sifre` yok. Doğru şifre → `/panel/teklifler`.
   b. **JS kapalı** (`page.route("**/*.js", r => r.abort())`) `/panel/giris` → düğme disabled ya da gönderilse bile URL'de
      `sifre=`/`kullaniciAdi=` yok.
   c. **Teklif:** betik önce vitrin formundan bir talep gönderir (ad "E2E Panel", 3 sn bekle, 201). Panelde 30 sn içinde
      rozet ≥ 1 (ya da sayfa yenileyince). Kartı kendi öğesinden bul → "WhatsApp'tan yaz" `href` `https://wa.me/90` ile
      başlıyor, "Ara" `href` `tel:+90` ile başlıyor → durumu "Arandı" yap (PATCH 200) → "Arandı" sekmesinde, "Yeni"
      sekmesinde yok, sekme sayıları değişti → iç not yaz, kaydet (PATCH 200) → sayfayı yenile, not yerinde.
   d. **Proje:** yeni proje (başlık "E2E Proje <zaman>", kategori Drone, özet, YouTube bağlantısı
      `https://www.youtube.com/watch?v=dQw4w9WgXcQ`) → 201, taslak → `/projeler/<slug>` **404** (taslak sitede yok) →
      `sharp` ile üretilmiş 1600×900 JPG'yi kapak yükle (201) → önizleme görünür → 2 fotoğraf **birlikte seç**, sırayla
      2 ayrı POST gittiğini say → ikinci fotoğrafı yukarı taşı (`PUT /siralama` 200) → yayına al (PATCH 200) →
      `/projeler/<slug>` 200 ve başlık görünüyor → sil (onay penceresi → DELETE 200) → listede yok → `/projeler/<slug>` 404.
   e. **Ayar etkisi sitede:** `konum_satiri`'nı "E2E Konum" yap → PATCH yalnız o anahtarı taşıyor (gövdeyi yaz) → 200 →
      `/` açılışında "E2E Konum" görünüyor → eski değere geri al → 200 → sitede eski değer.
   f. **Hizmet:** ekle (aktif değil) → sitede `/hizmetler`'de yok → aktif yap → var → sil (onaylı) → yok.
   g. **Marka:** logo ile ekle (201) → ana sayfada görünüyor → pasif yap → yok → sil.
   h. **Oturum düşmesi:** çerezleri sil (`context.clearCookies()`), teklifler sayfasında bir işlem yap → **tek** yönlendirme
      ile `/panel/giris` (yönlendirme sayısını say).
   i. **Şifre ekranı:** yeni ≠ tekrar → istek gitmedi (sayaç 0), mesaj görünür. Yanlış eski şifre → 400/401 mesajı.
      (Şifre gerçekten DEĞİŞTİRİLMEZ.)
   j. Her sayfada 390 px'te `document.documentElement.scrollWidth <= 390` — sayfa sayfa yaz.
   k. Panelde sitenin üst bölümü/WhatsApp düğmesi **yok** (seçiciyle say → 0); vitrinde hâlâ var (→ 1).
   `pageerror` + `console.error` sayısı yaz (0 olmalı). Betiğin oluşturduğu her şeyi (proje, hizmet, marka) betik siler;
   teklif talebi silinmez (karar 0003) — adı "E2E Panel" kalır.
9. `node codex/e2e-vitrin.mjs` bir kez — vitrin bozulmadı (çıktıyı yapıştır).
10. **Ekran görüntüleri** `codex/ekran/`: `10-giris-390.png`, `11-teklifler-390.png`, `12-teklifler-1440.png`,
    `13-proje-duzenle-1440.png` (kapak + fotoğraflar), `14-proje-yukleme-390.png` (yükleme durum listesi),
    `15-ayarlar-1440.png`, `16-ayarlar-390.png`, `17-menu-diger-390.png`, `18-kayitlar-390.png`, `19-sil-onay-390.png`.
11. `git status --short` → `src/lib`, `src/app/api`, `prisma`, `tests`, `tools` görünmemeli (yapıştır).

## 6b. Görev 01 denetiminden — vitrin düzeltmeleri (D01)

Claude Görev 01'i denetledi (rapor, ekranlar, kendi tarayıcı turu: konsol hatası 0). İyi iş. Üç düzeltme:

1. **Proje ızgarası kartı** (`/projeler`, 1440 px): YouTube küçük resmi (`hqdefault.jpg`, 4:3, içinde siyah bant gömülü)
   kartta üstte/altta **siyah bantlarla** görünüyor. Kart görseli 16:9 kutuda `object-cover` + ortalı olsun — bant kırpılır.
   Aynı kontrolü proje detayı, öne çıkan şeritler ve galerideki YouTube kaynaklı görsellerde de yap.
   Kanıt: `03b-projeler-1440.png` (ekran boyu, ilk sıra kartlar görünür).
2. **Sayfa başlığı üstündeki firma adı** (`PageHeading` `label={v.firma.ad}`): logonun hemen altında her sayfada aynı ad
   tekrarlanıyor. Kaldır (prop'u ve çizimini SİL) ya da sayfaya özgü bir arayüz etiketi koy ("Portföy", "İletişim" gibi).
3. **Açılışta üst bölüm okunurluğu:** poster/video üst kısmı parlak olunca logo ve menü düğmesi zemine karışıyor
   (örnek veride futbol turnuvası karesi). Açılışın üstüne yukarıdan aşağı ince bir koyu degrade ekle (yalnız ilk ~180 px).
   Kanıt: `01b-ana-ilk-ekran-1440.png` ve `01b-ana-ilk-ekran-390.png` (ekran boyu, tam sayfa değil).

## 7. Yasaklar

Beklentiyi gevşetme, adımı atlama, hatayı yutma. Kaldırılacak blok **silinir**, `hidden`/`display:none` ile gizlenmez.
Veritabanına doğrudan yazma (her şey API'den). Şifreyi değiştirme. Sırları rapora yazma. Commit/push yok.

## 8. Rapor — `codex/RAPOR/RAPOR-02.md`

```
## Yapılan adımlar
## Kanıt çıktıları        (komut + çıktı, olduğu gibi)
## Ekran görüntüleri
## Yapılamayanlar ve sebebi
## Arka uçtan beklenen
## Kullanıcıdan beklenen
```
