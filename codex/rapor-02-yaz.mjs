import { readFile, writeFile, stat } from 'node:fs/promises';

const logs = [
  ['TypeScript', '02-tsc.txt'], ['Lint', '02-lint.txt'],
  ['Kaynak taramaları, Git durumu ve korunan dosyalar', '02-taramalar.txt'],
  ['Mevcut arka uç testleri', '02-api.txt'],
  ['Panel uçtan uca — dev, birinci tur', '02-panel-1.txt'],
  ['Panel uçtan uca — dev, ikinci tur', '02-panel-2.txt'],
  ['Vitrin uçtan uca — dev', '02-vitrin.txt'],
  ['Üretim derlemesi — dev dizininden ayrı kopya', '02-build.txt'],
  ['Üretimde oturum koruması ve ilk HTML', '02-uretim-okuma.txt'],
  ['Panel uçtan uca — üretim', '02-panel-prod.txt'],
  ['API sarmalayıcısı — yalıtılmış davranış testi', '02-api-wrapper.txt'],
  ['Rapor/betik/günlüklerde şifre bulunmadığının kontrolü', '02-sir-kontrol.txt'],
];
let report = `## Yapılan adımlar

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
`;
for (const [label, file] of logs) {
  const output = (await readFile(`codex/kanit/${file}`, 'utf8')).replace(/^\uFEFF/, '');
  if (file !== '02-taramalar.txt' && output.includes('Çıkış kodu: 1')) throw new Error(`Başarısız kanıt: ${file}`);
  report += `\n${label}\n\n\`\`\`text\n${output.trimEnd()}\n\`\`\`\n`;
}
report += '\n## Ekran görüntüleri\n\nSon üretim tarayıcı turundan; giriş ekranı şifre girilmeden çekilir.\n\n';
const shots = [
  '10-giris-390.png', '11-teklifler-390.png', '12-teklifler-1440.png',
  '13-proje-duzenle-1440.png', '14-proje-yukleme-390.png',
  '15-ayarlar-1440.png', '16-ayarlar-390.png', '17-menu-diger-390.png',
  '18-kayitlar-390.png', '19-sil-onay-390.png',
  '03b-projeler-1440.png', '01b-ana-ilk-ekran-1440.png', '01b-ana-ilk-ekran-390.png',
];
for (const shot of shots) {
  const { size } = await stat(`codex/ekran/${shot}`);
  report += `- [${shot}](../ekran/${shot}) — ${size} bayt\n`;
}
report += `
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
`;
await writeFile('codex/RAPOR/RAPOR-02.md', report, 'utf8');
console.log(`RAPOR-02.md yazıldı; ${logs.length} ham kanıt ve ${shots.length} ekran bağlantısı.`);
