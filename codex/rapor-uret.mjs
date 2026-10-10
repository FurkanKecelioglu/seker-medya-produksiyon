import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const read = name => readFile(`codex/RAPOR/${name}`, 'utf8');
for (const name of ['e2e-1.txt', 'e2e-2.txt', 'e2e-uretim.txt']) {
  assert.match(await read(name), /SONUÇ: TÜM VİTRİN SENARYOLARI GEÇTİ/);
}
const sections = [];
sections.push(`## Yapılan adımlar

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
`);

async function proof(title, command, file) {
  sections.push(`### ${title}\n\nKomut:\n\n\`\`\`text\n${command}\n\`\`\`\n\nÇıktı:\n\n\`\`\`text\n${(await read(file)).trimEnd()}\n\`\`\`\n`);
}
await proof('Tür denetimi, lint, taramalar ve git',
  'node codex/kanit-topla.mjs\n(Betiğin çalıştırdığı her gerçek komut aşağıda $ ile yazılıdır.)', 'son-kontroller.txt');
await proof('Gerçek awk satır denetimi',
  'LC_ALL=en_US.UTF-8 MSYS_NO_PATHCONV=1\nawk \'length > 140 {print FILENAME":"FNR}\' $(rg --files src --path-separator / -g "*.tsx" -g "*.ts" -g "*.css" -g "!src/generated/**")\n(Git Bash; node codex/awk-kontrol.mjs)',
  'awk-satir.txt');
await proof('Ön yüz kapsamının satır denetimi', 'node codex/on-yuz-kontrol.mjs', 'on-yuz-satir.txt');
await proof('Görev başındaki git durumu', 'git status --short', 'git-baslangic.txt');
await proof('E2E — dev, birinci tur', 'node codex/e2e-vitrin.mjs', 'e2e-1.txt');
await proof('E2E — dev, ikinci tur', 'node codex/e2e-vitrin.mjs', 'e2e-2.txt');
await proof('Üretim derlemesi',
  'node codex/uretim-prova.mjs build\n(TEMP kaynak kopyasında: next build --webpack; TZ=UTC)', 'uretim-build.txt');
await proof('Üretim sunucusu', 'node codex/uretim-prova.mjs start\n(next start -p 3061 -H 127.0.0.1)', 'uretim-start.txt');
await proof('E2E — üretim',
  '$env:VITRIN_TEST_URL="http://localhost:3061"\nnode codex/e2e-vitrin.mjs', 'e2e-uretim.txt');
await proof('Üretim HTTP, 404 ve hata sunumu', 'node codex/ek-kontrol.mjs', 'ek-kontrol.txt');
await proof('Mevcut API testleri',
  'npm test\n(node codex/api-prova.mjs: yerel test parolasını yalnız süreç ortamından geçirir.)', 'api-tests.txt');
await proof('Paket geri alma doğrulaması', 'node codex/kurtarma-kontrol.mjs', 'kurtarma.txt');
await proof('Kurulu marka ikonlarının kontrolü',
  `node -e "const i=require('lucide-react'); console.log('Kurulu lucide-react sürümü:',require('lucide-react/package.json').version); for(const n of ['Instagram','Youtube','Facebook','Linkedin']) console.log(n+': '+typeof i[n]);"`,
  'marka-ikonlari.txt');

sections.push(`## Ekran görüntüleri

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
`);
await writeFile('codex/RAPOR/RAPOR-01.md', sections.join('\n'), 'utf8');
console.log('Rapor yazıldı: codex/RAPOR/RAPOR-01.md');
