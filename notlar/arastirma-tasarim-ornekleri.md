# Araştırma — prodüksiyon şirketi web siteleri (2026-10-09)

Amaç: rapordaki yapıya (§1-§6) uyan, örnek sitelerden alınmış somut desenler. Codex Görev 01'in tasarım yönü.
Rapor bağlayıcıdır; buradaki desenler raporun **içini doldurur**, sırasını ve kapsamını değiştirmez.

## İncelenen siteler
| Site | Ne alınır |
|---|---|
| [The Lift](https://thelift.mx) | İş önce gelir: açılışta oynayan siyah-beyaz reel + oynat düğmesi, künye yazısı film jeneriği gibi |
| [Harvest Film Company](https://www.harvestfilmcompany.com) | Siyaha yakın zemin; projeler "jenerik kartı" gibi: **başlık · biçim · müşteri**. Logolardan sonra tek "İletişim" çağrısı |
| [Monster & Bear](https://www.monsterandbear.com.au) | Disiplin: tek kare, tek cümle, **tek vurgu rengi** |
| [Here Now Films](https://www.herenow.film/london) | Kurumsal müşteriyi ikna eden: açılışın hemen altında **güven satırı** (yıl, iş sayısı, şehir), somut rakamlar, adım adım **süreç**, sabit "Bize yazın" düğmesi, kurucunun adı ve telefonu |
| [NaF+](https://naf.plus) | Kategoriler yayın platformu türleri gibi; siyah + sarı koyu arayüz. **Alınmayacak:** seçili işlerin 12 slaytlık karuselde saklanması |
| [ACOR](https://www.awwwards.com/inspiration/projects-grid-acor), [Archipelago](https://theinfluenceagency.com/case-studies/archipelago) | Proje ızgarası + **kategori süzgeci**, ayrı ve dikkat dağıtmayan proje sayfası |
| [Kestrel Aerial](https://kestrelaerialco.com) (şablon) | Drone bölümünde **lisans iddiası başlıkta** — yalnız lisans varsa |
| [Cactus Wren](https://cactuswrencreative.com), [Wren & Willow](https://wrenwillowfilms.com) (şablon) | **Şehir adı üst satırda** ("Savannah & the Lowcountry") — yerel arama için |

Türkiye'den bölgesel bir prodüksiyon firmasının örnek alınacak sitesi bulunamadı (aramalar ekipman üreticilerine ve
büyük OB firmalarına çıktı, ör. Saran/HD Protek). Bu da araştırma notundaki "yerel rakip zayıf" gözlemini destekliyor.

## Rapora uyan tasarım kararları (öneri)
Rapor §5: koyu/siyah sinematik, beyaz-gri tipografi, **tek vurgu: kırmızı**, Manrope/Inter/Oswald, az metin, büyük görsel.

1. **Açılış (rapor §2.1):** tam ekran açılış videosu (sessiz, döngü, poster önce), üstünde slogan + alt slogan,
   iki düğme: **"Proje Teklifi Al"** (kırmızı) ve **"Showreel'i izle"** (çizgili). Mobilde video yerine poster (veri tasarrufu).
   Üst satırda küçük harfle konum: *"Çankırı merkezli · Türkiye geneli"* (yerel arama; panelden değişir — `alt_slogan`/yeni ayar).
2. **Güven satırı** (Here Now): açılışın hemen altında ince bir şerit — *"20+ yıl saha deneyimi · Canlı yayın · Drone · Kurgu"*.
   Rakamlar firmadan teyit edilmeden yazılmaz.
3. **Kısa tanıtım + süreç (rapor §2.2, §7):** rapordaki "ilk fikrinden çekim aşamasına, kurgudan yayına" cümlesi
   dört adımlı bir süreç şeridine dönüşür: **Fikir → Çekim → Kurgu → Yayın**. Raporun kendi metni, ek içerik değil.
4. **8 hizmet kartı (§2.3):** ikon + başlık + tek satır; üzerine gelince kırmızı çizgi ve hafif yükselme.
5. **Showreel (§2.4):** geniş 16:9 çerçeve, poster + büyük oynat düğmesi; YouTube **tıklanınca** yüklenir (API.md).
6. **Öne çıkan 6 proje (§2.5, §4):** jenerik kartı gibi — kapak, **kategori · yıl**, başlık, müşteri. Karusel değil ızgara
   (masaüstü 3, tablet 2, mobil 1 sütun). Video ön izlemesi üzerine gelince oynatılmaz (YouTube iframe'i ağır); kapak yakınlaşır.
7. **Canlı yayın ve drone bölümleri (§2.6-7):** tam genişlik, görsel bir yanda metin bir yanda; ikisi aynalı.
   Drone başlığında "lisanslı" yalnız firma teyit ederse.
8. **Markalar (§2.8):** gri tonlu logolar, üzerine gelince renkli. Logo yoksa bölüm hiç çizilmez.
9. **Güçlü çağrı (§2.9):** tam genişlik kırmızı/siyah bant, büyük başlık, "Proje Teklifi Al" + WhatsApp + telefon.
10. **Her sayfada:** sabit üst menüde "Proje Teklifi Al" düğmesi (§1); mobilde alt köşede WhatsApp düğmesi (§6).
11. **Projeler sayfası:** kategori sekmeleri (Video, Fotoğraf, Drone, Canlı Yayın, TV — yalnız dolu olanlar).
    **Proje detayı:** büyük video/kapak, künye (kategori, müşteri, yıl), açıklama, fotoğraflar, önceki/sonraki.
12. **Galeri:** taşan (masonry) ızgara + tam ekran görüntüleyici (klavye ve kaydırma ile).

## Kaçınılacaklar (örneklerde görülen hatalar)
- Seçili işleri karusel içinde saklamak (NaF+) — ziyaretçi 2. slayta geçmez.
- Anahtar kelime doldurulmuş `alt` metinleri (Harvest) — `alt` görseli anlatır.
- Tutarsız rakamlar (Here Now'da üç ayrı yorum sayısı) — her rakam tek kaynaktan (panel).
- Mobilde otomatik oynayan ağır video, ses açık başlayan video, kaydırmayı ele geçiren animasyonlar.
- Uydurma müşteri logosu / ödül rozeti.

## Kaynaklar
- https://www.zarla.com/guides/video-and-film-production-company-website-examples
- https://fireart.studio/blog/20-amazing-video-website-design-examples/
- https://www.designrush.com/best-designs/websites/film-production-company
- https://www.awwwards.com/inspiration/projects-grid-acor
- https://theinfluenceagency.com/case-studies/archipelago
- https://broadcastprome.com/case-studies/smart-vans (HD Protek)
