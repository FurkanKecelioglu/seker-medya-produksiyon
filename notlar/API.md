# API ve veri sözleşmesi

Ekranları yazan (Codex) için. Arka uç bu sözleşmeyi bozmadan değişebilir; sözleşme değişirse bu dosya da değişir.
Bütün cevaplar JSON. Hata: `{ hata: "insanca mesaj", alan?: "alanAdı" }` + 4xx — `alan` varsa o kutunun altında göster.

## Herkese açık site — sunucu bileşenlerinden doğrudan okunur (API yok)

`src/lib/vitrin.ts`:

| Fonksiyon | Ne verir | Nerede |
|---|---|---|
| `vitrinVerisi()` | firma (ad, slogan, altSlogan, logo), metinler, medya (açılış videosu/posteri, bölüm görselleri, showreel), iletişim, sosyal, hizmetler, `oneCikanProjeler` (en çok 6), markalar, `kategoriler` (yalnız projesi olanlar, adetle) | her sayfa; `cache()` ile istek başına bir kez okunur |
| `projeListesi()` | yayındaki bütün projeler (`ProjeKarti[]`) | /projeler — kategori süzgeci ekranda |
| `projeDetayi(slug)` | kart + aciklama + fotolar + onceki/sonraki; taslak/olmayan → `null` → `notFound()` | /projeler/[slug] |
| `galeri()` | galerideki fotoğraflar (+ bağlı olduğu proje) | /galeri |

- Görsel nesnesi: `{ url, genislik, yukseklik }` — `genislik/yukseklik` null olabilir (dış kaynak). `next/image` ile
  kullan (`width/height` ver; AVIF/WebP ve küçük kopyaları Next üretir). Açılış görseli `priority`, gerisi lazy.
- `ProjeKarti.kapak`: yüklenen kapak → yoksa YouTube küçük resmi → yoksa `null` (düz zemin + kategori adı çiz).
- `video` (VideoBilgisi): `{ saglayici, kimlik, gommeAdresi, izlemeAdresi, kucukResim }`.
  **Sayfa açılışında iframe KOYMA.** Kapak + oynat düğmesi göster; tıklanınca `gommeAdresi` ile iframe (otomatik oynar).
- `medya.acilisVideosu`: `{ url, tur }` ya da null. `<video muted autoplay loop playsinline poster=…>`.
  Mobilde (dar ekran) ve `navigator.connection.saveData` / `prefers-reduced-motion` açıkken video yükleme, yalnız poster.
- `medya.girisVideosu`: `{ masaustu: {url,tur}, mobil: {url,tur} }` ya da null — **giriş animasyonu** (karar 0002 eki).
  null → animasyon yok, açılış doğrudan görünür. Yalnız biri yüklüyse arka uç onu iki alana da koyar.
  Oturumda bir kez (`sessionStorage`), "Geç" düğmesi ilk kareden, ESC kapatır; reduced-motion / `saveData` açıkken
  hiç yüklenmez. Ekran genişliğine göre **tek** `<video>` basılır (CSS ile gizlenen ikinci video da iner).
  H1 ve açılış metni animasyonun ALTINDA, DOM'da ilk boyadan var. Oynatılamazsa/donarsa (ilerleme 4 sn durursa)
  kapanır, sayfa asla kilitli kalmaz. Örnek: `cankiri-gazozu/src/components/hero/HeroIntro.tsx`.
- `metinler.konumSatiri` (açılışın üstündeki küçük satır), `metinler.guvenSatiri` (açılış altı ince şerit) — ikisi de
  `null` olabilir → o öğe hiç çizilmez. `metinler.surecAdimlari`: `[{ baslik, aciklama }]` (Fikir → Çekim → Kurgu → Yayın;
  panelden değişir, sayıyı sabit varsayma). `metinler.hakkimizda`, `canliYayinMetni`, `droneMetni`, `cagriMetni` boş olabilir.
- `iletisim.telefonLinki` (`tel:+90…`), `whatsappLinki` (`https://wa.me/90…`), `telefonMetni` ("0532 123 45 67") hazır gelir — biçimlendirme yapma.
- Kategori adları ve adres parçaları: `src/lib/kategoriler.ts` (`KATEGORILER`, `kategoriYoldan`). Hizmet ikonları: `HIZMET_IKONLARI`
  (lucide-react adları — istemcide `lucide-react`'ten bu adla çiz).
- SEO: `src/lib/seo.ts` → `firmaVerisi(v)` + `jsonLd()` ana sayfada `<script type="application/ld+json">`.
  Proje detay sayfası `generateMetadata` ile kendi başlığını/kapağını versin.

Sayfa listesi (rapor §1): `/`, `/hakkimizda`, `/hizmetler`, `/projeler`, `/projeler/[slug]`, `/galeri`, `/iletisim`, `/teklif-al`.
Site haritası bu listeyi kullanıyor (`src/app/sitemap.ts`) — sayfa adı değişirse haber ver.

### Teklif formu

- `GET /api/teklif/jeton` → `{ jeton }` — form ekrana gelince (mount) al.
- `POST /api/teklif` `{ ad, telefon, eposta?, firma?, hizmet?, etkinlikTarihi? ("YYYY-MM-DD"), mesaj, kvkk: true, jeton, web_sitesi: "" }`
  → 201 `{ ok: true }`.
  - `web_sitesi`: **görünmeyen** bal küpü alanı. `display:none` DEĞİL (bazı botlar anlar): ekran dışına konumla,
    `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`. Değeri olduğu gibi gönder.
  - 400 `alan: "jeton"` → "sayfayı yenileyin" mesajını göster ve yeni jeton al.
  - 429 → mesajı göster (telefon/WhatsApp ile ulaşma önerisi metinde var).
  - Hizmet seçimi: `vitrinVerisi().hizmetler` başlıkları + "Diğer".
- `<form method="post">` + gönder düğmesi hidrasyona kadar `disabled` (rehber §7.24/138). Çift tıklamada tek istek.

## Panel — `/api/panel/*` (oturum çerezi; oturumsuz 401 → `/panel/giris`'e yönlendir)

| Uç | Gövde / sorgu | Cevap |
|---|---|---|
| `POST /giris` | `{ kullaniciAdi, sifre }` | `{ id, ad }` · 401 hatalı · 429 `{ tekrarSn }` |
| `POST /cikis` | — | `{ ok }` |
| `GET /ben` | — | `{ id, ad, kullaniciAdi, yeniTeklif }` — menüde rozet |
| `POST /sifre` | `{ eskiSifre, yeniSifre }` (en az 10) | `{ ok }` — diğer cihazlar düşer |
| `GET /ayarlar` | — | `{ metin: {anahtar: değer}, medya: {anahtar: {url,genislik,yukseklik}\|null}, alanlar: { metin: [{anahtar, etiket, enUzun}], medya: [{anahtar, etiket, tur}] } }` — **formu `alanlar`dan çiz** |
| `PATCH /ayarlar` | `{ anahtar: değer, … }` yalnız değişenler | `{ ok }` · 400 `alan` |
| `POST /ayarlar/medya/<anahtar>` | multipart `dosya` | 201 `{ url, genislik, yukseklik }` |
| `DELETE /ayarlar/medya/<anahtar>` | — | `{ ok }` |
| `GET /hizmetler` | — | `{ hizmetler, ikonlar }` |
| `POST /hizmetler` | `{ baslik, ozet, ikon, aktif? }` | 201 hizmet |
| `PATCH /hizmetler/<id>` | kısmi | hizmet |
| `DELETE /hizmetler/<id>` | — | `{ ok }` |
| `GET /projeler` | — | `{ projeler, oneCikanSiniri }` — öne çıkan sayısı sınırı aşarsa uyar |
| `POST /projeler` | `{ baslik, kategori, ozet, slug?, musteri?, yil?, aciklama?, videoAdresi?, oneCikan?, yayinda? }` | 201 proje (varsayılan taslak) · 409 adres çakışması |
| `GET /projeler/<id>` | — | proje + `fotolar` |
| `PATCH /projeler/<id>` | kısmi; `videoAdresi: ""` videoyu kaldırır; `slug` yalnız gönderilirse değişir | proje |
| `DELETE /projeler/<id>` | — | `{ ok }` — fotoğraflarıyla; **geri alınamaz, onay iste** |
| `POST /projeler/<id>/kapak` | multipart `dosya` | 201 `{ url, genislik, yukseklik }` |
| `DELETE /projeler/<id>/kapak` | — | `{ ok }` |
| `GET /fotolar?proje=<id>\|galeri` | — | `{ fotolar, toplam }` |
| `POST /fotolar` | multipart `dosya`, `projeId?`, `aciklama?`, `galeride?` ("false") | 201 foto — **çoklu seçimde dosyaları SIRAYLA tek tek gönder**, ilerleme göster |
| `PATCH /fotolar/<id>` | `{ aciklama?, galeride?, projeId? }` | foto |
| `DELETE /fotolar/<id>` | — | `{ ok }` |
| `GET /markalar` | — | `{ markalar }` |
| `POST /markalar` | multipart `ad`, `url?`, `logo?` | 201 marka |
| `PATCH /markalar/<id>` | `{ ad?, url?, aktif? }` | marka |
| `POST /markalar/<id>/logo`, `DELETE …/logo` | multipart `dosya` | marka |
| `DELETE /markalar/<id>` | — | `{ ok }` |
| `PUT /siralama` | `{ tur: "hizmet"\|"proje"\|"foto"\|"marka", idler: [...] }` — **listenin TAMAMI** (foto için o projenin tümü) | `{ ok }` · 400 eksik liste |
| `GET /teklifler?durum=&sayfa=` | — | `{ toplam, sayfa, sayfaBoyu, durumlar: [{kod, ad, adet}], talepler }` — talepte `whatsappLinki`, `telefonLinki`, `olusturmaMetni`, `etkinlikTarihiMetni` hazır |
| `PATCH /teklifler/<id>` | `{ durum?, icNot? }` | talep |
| `GET /kayitlar?sayfa=&eylem=` | — | denetim izi, sayfalı |

Sayfa tarafında oturum kapısı: `await sayfaOturumu()` (`src/lib/guard.ts`) — panel sayfasının en üstünde.

## Yüklenen dosyalar

`/yuklemeler/<dosya>` — fotoğraflar WebP (en uzun kenar: kapak/foto 2400, logo 800, paylaşım 1200), EXIF silinmiş.
Fotoğraf en çok 20 MB (JPG/PNG/WebP/AVIF), açılış videosu en çok 25 MB (MP4/WebM). Bu sınırları formda önceden göster.
Dosya seçici: `accept="image/jpeg,image/png,image/webp,image/avif"` — **`image/*` YAZMA**. Sunucu HEIC açamıyor;
iPhone, listede HEIC yoksa fotoğrafı kendisi JPEG'e çevirip gönderir. Video seçici: `accept="video/mp4,video/webm"`.
