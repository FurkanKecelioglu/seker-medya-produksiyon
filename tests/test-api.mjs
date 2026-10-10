// Uçtan uca API testi — gerçek HTTP üzerinden, çalışan sunucuya karşı (rehber §8).
// Kullanım: npm run dev açıkken  `node tests/test-api.mjs`
// Şifre ortamdan gelir: TEST_SIFRE, yoksa .env'deki SEED_SIFRE_YONETICI. Koda yazılmaz (depo GitHub'a gider).
// Kendi oluşturduğu her kaydı sonda siler, değiştirdiği ayarları eski hâline getirir.
// Hız sınırına takılmamak için her istek ayrı X-Real-IP taşır — yerelde vekil
// olmadığı için bu başlık doğrudan okunur; canlıda Caddy üzerine yazar.
import "dotenv/config";
import sharp from "sharp";

const URL_ = process.env.TEST_URL || "http://localhost:3060";
const SIFRE = process.env.TEST_SIFRE || process.env.SEED_SIFRE_YONETICI;
if (!SIFRE) { console.error("TEST_SIFRE ya da .env SEED_SIFRE_YONETICI gerekli"); process.exit(1); }
let gecen = 0, kalan = 0;
const check = (ad, kosul, ayrinti = "") => {
  if (kosul) { gecen++; console.log(`  ✓ ${ad}`); }
  else { kalan++; console.log(`  ✗ ${ad} ${ayrinti}`); }
};
let ipSayac = 1;
const yeniIp = () => `10.7.${Math.floor(ipSayac / 250)}.${(ipSayac++ % 250) + 1}`;
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

function istemci() {
  let cerez = "";
  return async (yol, { method = "GET", body, form, ip, headers: ek = {} } = {}) => {
    const headers = { "x-real-ip": ip || yeniIp(), ...ek };
    if (cerez) headers.cookie = cerez;
    let govde;
    if (form) govde = form;
    else if (body !== undefined) { headers["content-type"] = "application/json"; govde = JSON.stringify(body); }
    const r = await fetch(URL_ + yol, { method, headers, body: govde, redirect: "manual" });
    const sc = r.headers.get("set-cookie");
    if (sc) cerez = sc.split(";")[0];
    const tur = r.headers.get("content-type") || "";
    let json = null, bayt = null;
    if (tur.includes("json")) json = await r.json();
    else bayt = new Uint8Array(await r.arrayBuffer());
    return { durum: r.status, json, bayt, headers: r.headers };
  };
}

/** Test görseli: EXIF'li JPEG (EXIF'in silindiğini doğrulamak için) */
async function jpeg(genislik = 3000, yukseklik = 2000) {
  return sharp({ create: { width: genislik, height: yukseklik, channels: 3, background: { r: 180, g: 20, b: 30 } } })
    .jpeg()
    .withExif({ IFD0: { Copyright: "GIZLI-KONUM-TESTI", Artist: "test" } })
    .toBuffer();
}

function dosyaFormu(alan, veri, ad, tur, ek = {}) {
  const f = new FormData();
  f.append(alan, new Blob([veri], { type: tur }), ad);
  for (const [k, v] of Object.entries(ek)) f.append(k, v);
  return f;
}

const anon = istemci();
const y = istemci(); // yönetici
const y2 = istemci(); // aynı hesap, ikinci cihaz
const temizlik = { projeler: [], hizmetler: [], markalar: [], fotolar: [] };

async function main() {
  console.log(`Hedef: ${URL_}`);

  console.log("\n# Giriş");
  let r = await y("/api/panel/giris", { method: "POST", body: { kullaniciAdi: "yonetici", sifre: "yanlis-sifre" } });
  check("yanlış şifre 401", r.durum === 401, JSON.stringify(r.json));
  r = await y("/api/panel/ben");
  check("oturumsuz /ben 401", r.durum === 401);
  r = await y("/api/panel/giris", { method: "POST", body: { kullaniciAdi: "  YONETICI ", sifre: SIFRE } });
  check("büyük harf + boşluklu kullanıcı adıyla giriş 200 (normalleştirme)", r.durum === 200, JSON.stringify(r.json));
  r = await y("/api/panel/ben");
  check("/ben oturumdaki yöneticiyi ve yeni teklif sayısını verir",
    r.json?.kullaniciAdi === "yonetici" && typeof r.json?.yeniTeklif === "number", JSON.stringify(r.json));
  r = await y2("/api/panel/giris", { method: "POST", body: { kullaniciAdi: "yonetici", sifre: SIFRE } });
  check("ikinci cihaz giriş 200", r.durum === 200);

  console.log("\n# Oturumsuz panel uçları 401");
  const uclar = [
    ["GET", "/api/panel/ayarlar"], ["PATCH", "/api/panel/ayarlar"], ["POST", "/api/panel/ayarlar/medya/logo"],
    ["GET", "/api/panel/hizmetler"], ["POST", "/api/panel/hizmetler"], ["PATCH", "/api/panel/hizmetler/1"],
    ["GET", "/api/panel/projeler"], ["POST", "/api/panel/projeler"], ["DELETE", "/api/panel/projeler/1"],
    ["POST", "/api/panel/projeler/1/kapak"], ["GET", "/api/panel/fotolar"], ["POST", "/api/panel/fotolar"],
    ["DELETE", "/api/panel/fotolar/1"], ["GET", "/api/panel/markalar"], ["POST", "/api/panel/markalar"],
    ["PUT", "/api/panel/siralama"], ["GET", "/api/panel/teklifler"], ["PATCH", "/api/panel/teklifler/1"],
    ["GET", "/api/panel/kayitlar"], ["POST", "/api/panel/sifre"],
  ];
  const istek = ([m, u]) => anon(u, { method: m, body: m === "GET" ? undefined : {} }).then((x) => [m, u, x.durum]);
  const sonuc = await Promise.all(uclar.map(istek));
  const kacak = sonuc.filter(([, , d]) => d !== 401);
  check(`${uclar.length} panel ucunun hepsi oturumsuz 401`, kacak.length === 0, JSON.stringify(kacak));

  console.log("\n# Ayarlar");
  r = await y("/api/panel/ayarlar");
  check("ayarlar okunur, alan tanımlarıyla", r.durum === 200 && r.json.metin.firma_adi && r.json.alanlar.metin.length > 10, JSON.stringify(r.json).slice(0, 200));
  const eskiAyar = { telefon: r.json.metin.telefon, showreel: r.json.metin.showreel, eposta: r.json.metin.eposta };
  // Önce farklı bir numara: veritabanında zaten 0532… varsa değişiklik olmaz ve denetim izi kaydı oluşmaz
  await y("/api/panel/ayarlar", { method: "PATCH", body: { telefon: "0555 000 00 01" } });
  r = await y("/api/panel/ayarlar", { method: "PATCH", body: { telefon: "0532 123 45 67", showreel: "https://youtu.be/dQw4w9WgXcQ", eposta: "info@ornek.com" } });
  check("telefon + showreel + e-posta kaydı 200", r.durum === 200, JSON.stringify(r.json));
  r = await y("/api/panel/ayarlar");
  check("telefon normalleştirilmiş saklanır (05321234567)", r.json.metin.telefon === "05321234567", r.json.metin.telefon);
  r = await y("/api/panel/ayarlar", { method: "PATCH", body: { telefon: "12345" } });
  check("geçersiz telefon 400 + alan adı", r.durum === 400 && r.json.alan === "telefon", JSON.stringify(r.json));
  r = await y("/api/panel/ayarlar", { method: "PATCH", body: { showreel: "https://kotu-site.com/video" } });
  check("YouTube/Vimeo olmayan showreel 400", r.durum === 400 && r.json.alan === "showreel", JSON.stringify(r.json));
  r = await y("/api/panel/ayarlar", { method: "PATCH", body: { firma_adi: "   " } });
  check("firma adı boş bırakılamaz 400", r.durum === 400, JSON.stringify(r.json));
  r = await y("/api/panel/ayarlar", { method: "PATCH", body: { bilinmeyen: "x" } });
  check("bilinmeyen ayar anahtarı 400", r.durum === 400, JSON.stringify(r.json));
  r = await y("/api/panel/ayarlar", { method: "PATCH", body: { slogan: "x".repeat(161) } });
  check("üst sınırı aşan metin 400", r.durum === 400, JSON.stringify(r.json));
  r = await anon("/");
  const html = new TextDecoder().decode(r.bayt);
  // Yalnız üretim derlemesinde anlamlı: dev her istekte üretir. Donmuş sayfa panel değişikliğini hiç göstermez.
  check("ana sayfa derlemede dondurulmamış (her istekte üretilir)",
    !r.headers.get("x-nextjs-prerender") && !/s-maxage=\d{4,}/.test(r.headers.get("cache-control") || ""),
    `${r.headers.get("x-nextjs-prerender")} ${r.headers.get("cache-control")}`);
  check("ana sayfa telefon bağlantısını +90 ile üretir", html.includes("tel:+905321234567"), html.slice(0, 100));
  check("ana sayfada schema.org verisi var", html.includes('"@type":"ProfessionalService"'));

  console.log("\n# Hizmetler");
  r = await y("/api/panel/hizmetler", { method: "POST", body: { baslik: "Test Hizmet", ozet: "Kısa", ikon: "OlmayanIkon" } });
  check("listede olmayan ikon 400", r.durum === 400, JSON.stringify(r.json));
  r = await y("/api/panel/hizmetler", { method: "POST", body: { baslik: "Test Hizmet", ozet: "Kısa açıklama", ikon: "Film" } });
  check("hizmet eklenir 201", r.durum === 201, JSON.stringify(r.json));
  const hizmetId = r.json?.id;
  temizlik.hizmetler.push(hizmetId);
  r = await y(`/api/panel/hizmetler/${hizmetId}`, { method: "PATCH", body: { aktif: false } });
  check("hizmet pasifleşir", r.durum === 200 && r.json.aktif === false);
  r = await anon("/");
  check("pasif hizmet vitrinde görünmez", !new TextDecoder().decode(r.bayt).includes("Test Hizmet"));

  console.log("\n# Projeler");
  r = await y("/api/panel/projeler", { method: "POST", body: { baslik: "Çorum İl Özel İdaresi Şölen Yayını", kategori: "CANLI_YAYIN", ozet: "Test projesi", videoAdresi: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s", oneCikan: true } });
  check("proje eklenir 201, varsayılan taslak", r.durum === 201 && r.json.yayinda === false, JSON.stringify(r.json));
  const p1 = r.json;
  temizlik.projeler.push(p1?.id);
  check("Türkçe başlıktan adres üretilir", p1?.slug === "corum-il-ozel-idaresi-solen-yayini", p1?.slug);
  check("YouTube bağlantısı kimliğe ayrıştırılır, gömme nocookie", p1?.video?.kimlik === "dQw4w9WgXcQ" && p1?.video?.gommeAdresi.startsWith("https://www.youtube-nocookie.com/embed/"), JSON.stringify(p1?.video));
  r = await y("/api/panel/projeler", { method: "POST", body: { baslik: "Çorum İl Özel İdaresi Şölen Yayını", kategori: "VIDEO", ozet: "İkinci" } });
  check("aynı başlık → adres -2 ile üretilir", r.durum === 201 && r.json.slug === "corum-il-ozel-idaresi-solen-yayini-2", JSON.stringify(r.json));
  const p2 = r.json;
  temizlik.projeler.push(p2?.id);
  r = await y(`/api/panel/projeler/${p2.id}`, { method: "PATCH", body: { slug: p1.slug } });
  check("elle yazılan çakışan adres 409", r.durum === 409, JSON.stringify(r.json));
  r = await y(`/api/panel/projeler/${p2.id}`, { method: "PATCH", body: { videoAdresi: "https://example.com/v/1" } });
  check("tanınmayan video bağlantısı 400", r.durum === 400, JSON.stringify(r.json));
  r = await y(`/api/panel/projeler/${p2.id}`, { method: "PATCH", body: { videoAdresi: "https://vimeo.com/76979871" } });
  check("Vimeo bağlantısı kabul edilir", r.durum === 200 && r.json.video?.saglayici === "vimeo", JSON.stringify(r.json?.video));
  r = await y(`/api/panel/projeler/${p2.id}`, { method: "PATCH", body: { kategori: "BILINMEYEN" } });
  check("geçersiz kategori 400", r.durum === 400);
  r = await y(`/api/panel/projeler/${p2.id}`, { method: "PATCH", body: { yil: 3000 } });
  check("saçma yıl 400", r.durum === 400);
  r = await anon("/");
  check("taslak öne çıkan proje vitrinde görünmez", !new TextDecoder().decode(r.bayt).includes("Şölen Yayını"));
  r = await y(`/api/panel/projeler/${p1.id}`, { method: "PATCH", body: { yayinda: true } });
  check("proje yayına alınır", r.durum === 200 && r.json.yayinda === true);
  r = await anon("/");
  check("yayındaki öne çıkan proje vitrinde görünür", new TextDecoder().decode(r.bayt).includes("Şölen Yayını"));

  console.log("\n# Kapak ve fotoğraf yükleme");
  r = await y(`/api/panel/projeler/${p1.id}/kapak`, { method: "POST", form: dosyaFormu("dosya", await jpeg(), "kapak.jpg", "image/jpeg") });
  check("kapak yüklenir 201, en uzun kenar 2400'e iner", r.durum === 201 && r.json.genislik === 2400 && r.json.yukseklik === 1600, JSON.stringify(r.json));
  const kapakUrl = r.json?.url;
  r = await anon(kapakUrl);
  check("kapak /yuklemeler'den image/webp olarak sunulur", r.durum === 200 && r.headers.get("content-type") === "image/webp");
  const meta = r.bayt ? await sharp(Buffer.from(r.bayt)).metadata() : {};
  check("yüklenen görselde EXIF yok", meta.format === "webp" && !meta.exif, JSON.stringify({ format: meta.format, exif: !!meta.exif }));
  r = await y(`/api/panel/projeler/${p1.id}/kapak`, { method: "POST", form: dosyaFormu("dosya", new TextEncoder().encode("<html><script>alert(1)</script></html>"), "x.jpg", "image/jpeg") });
  check("görsel olmayan dosya 400", r.durum === 400, JSON.stringify(r.json));
  // Kodlanmış "/" (%2F) içeren yolu Next bizim uca gelmeden 400 ile reddeder; düz "..\" 404.
  // Asıl ölçüt durum kodu değil: cevapta .env içeriği OLMAMALI.
  for (const yol of ["/yuklemeler/..%2F..%2F.env", "/yuklemeler/..%5C..%5C.env"]) {
    r = await anon(yol);
    const govde = r.bayt ? new TextDecoder().decode(r.bayt) : JSON.stringify(r.json);
    check(`yol geçişi reddedilir (${yol.slice(12, 18)}…)`, [400, 404].includes(r.durum) && !govde.includes("DATABASE_URL"), String(r.durum));
  }
  r = await anon("/yuklemeler/kapak.html");
  check("izinsiz uzantı 404", r.durum === 404);
  r = await y(`/api/panel/projeler/${p1.id}/kapak`, { method: "POST", form: dosyaFormu("dosya", await jpeg(1200, 800), "kapak2.jpg", "image/jpeg") });
  check("kapak değiştirilir", r.durum === 201 && r.json.url !== kapakUrl);
  r = await anon(kapakUrl);
  check("eski kapak dosyası silinir", r.durum === 404, String(r.durum));

  const fotoIdler = [];
  for (let i = 0; i < 3; i++) {
    r = await y("/api/panel/fotolar", { method: "POST", form: dosyaFormu("dosya", await jpeg(800, 600), `f${i}.jpg`, "image/jpeg", { projeId: String(p1.id), aciklama: `Foto ${i}` }) });
    fotoIdler.push(r.json?.id);
  }
  check("projeye 3 fotoğraf yüklenir, varsayılan galeride", fotoIdler.every(Boolean) && r.json.galeride === true, JSON.stringify(r.json));
  r = await y("/api/panel/fotolar", { method: "POST", form: dosyaFormu("dosya", await jpeg(800, 600), "g.jpg", "image/jpeg", { galeride: "true" }) });
  check("projesiz (yalnız galeri) fotoğraf 201", r.durum === 201 && r.json.projeId === null);
  temizlik.fotolar.push(r.json?.id);
  r = await y("/api/panel/fotolar", { method: "POST", form: dosyaFormu("dosya", await jpeg(80, 60), "x.jpg", "image/jpeg", { projeId: "999999" }) });
  check("olmayan projeye fotoğraf 404", r.durum === 404, JSON.stringify(r.json));

  r = await y("/api/panel/siralama", { method: "PUT", body: { tur: "foto", idler: [fotoIdler[0], fotoIdler[1]] } });
  check("eksik sıralama listesi 400", r.durum === 400, JSON.stringify(r.json));
  r = await y("/api/panel/siralama", { method: "PUT", body: { tur: "foto", idler: [fotoIdler[0], fotoIdler[0], fotoIdler[1]] } });
  check("tekrar eden kimlikli sıralama 400", r.durum === 400);
  r = await y("/api/panel/siralama", { method: "PUT", body: { tur: "foto", idler: [...fotoIdler].reverse() } });
  check("tam liste ters sırayla kaydedilir", r.durum === 200, JSON.stringify(r.json));
  r = await y(`/api/panel/fotolar?proje=${p1.id}`);
  check("fotoğraflar yeni sırayla döner", JSON.stringify(r.json.fotolar.map((f) => f.id)) === JSON.stringify([...fotoIdler].reverse()), JSON.stringify(r.json.fotolar.map((f) => f.id)));
  r = await y(`/api/panel/fotolar/${fotoIdler[0]}`, { method: "PATCH", body: { galeride: false } });
  check("fotoğraf galeriden çıkarılır", r.durum === 200 && r.json.galeride === false);

  console.log("\n# Açılış videosu (Range)");
  const sahteMp4 = new Uint8Array(4096);
  sahteMp4.set([0, 0, 0, 0x18], 0);
  sahteMp4.set(new TextEncoder().encode("ftypisom"), 4);
  r = await y("/api/panel/ayarlar/medya/acilis_videosu", { method: "POST", form: dosyaFormu("dosya", sahteMp4, "acilis.mp4", "video/mp4") });
  check("MP4 başlıklı dosya kabul edilir 201", r.durum === 201 && r.json.url?.endsWith(".mp4"), JSON.stringify(r.json));
  const videoUrl = r.json?.url;
  r = await anon(videoUrl, { headers: { range: "bytes=0-1" } });
  check("Range isteği 206 + Content-Range (Safari şartı)", r.durum === 206 && r.headers.get("content-range") === "bytes 0-1/4096" && r.bayt.length === 2, `${r.durum} ${r.headers.get("content-range")}`);
  r = await anon(videoUrl, { headers: { range: "bytes=5000-" } });
  check("dosya dışı aralık 416", r.durum === 416, String(r.durum));
  r = await anon(videoUrl);
  check("aralıksız istek 200 video/mp4 tam boy", r.durum === 200 && r.headers.get("content-type") === "video/mp4" && r.bayt.length === 4096);
  r = await y("/api/panel/ayarlar/medya/acilis_videosu", { method: "POST", form: dosyaFormu("dosya", new TextEncoder().encode("bu bir video degil, html olabilir"), "x.mp4", "video/mp4") });
  check("başlığı video olmayan dosya 400 (uzantıya güvenilmez)", r.durum === 400, JSON.stringify(r.json));
  r = await y("/api/panel/ayarlar/medya/olmayan", { method: "POST", form: dosyaFormu("dosya", sahteMp4, "a.mp4", "video/mp4") });
  check("bilinmeyen medya anahtarı 404", r.durum === 404);
  r = await y("/api/panel/ayarlar/medya/acilis_videosu", { method: "DELETE" });
  check("açılış videosu kaldırılır", r.durum === 200);
  r = await anon(videoUrl);
  check("kaldırılan video dosyası da silinir", r.durum === 404);

  // Giriş animasyonu (karar 0002 eki) — video ayarı anahtardan bağımsız aynı yoldan geçer
  r = await y("/api/panel/ayarlar/medya/giris_videosu_mobil", { method: "POST", form: dosyaFormu("dosya", sahteMp4, "giris.mp4", "video/mp4") });
  check("giriş animasyonu (mobil) yüklenir 201", r.durum === 201 && r.json.url?.includes("giris-videosu-mobil"), JSON.stringify(r.json));
  const girisUrl = r.json?.url;
  r = await y("/api/panel/ayarlar/medya/giris_videosu_mobil", { method: "DELETE" });
  check("giriş animasyonu kaldırılır", r.durum === 200);
  r = await anon(girisUrl);
  check("kaldırılan giriş videosu dosyası da silinir", r.durum === 404);

  console.log("\n# Markalar");
  let f = new FormData(); f.append("ad", "Test Belediyesi"); f.append("url", "javascript:alert(1)");
  r = await y("/api/panel/markalar", { method: "POST", form: f });
  check("http(s) olmayan marka adresi 400", r.durum === 400, JSON.stringify(r.json));
  f = new FormData(); f.append("ad", "Test Belediyesi");
  r = await y("/api/panel/markalar", { method: "POST", form: f });
  check("logosuz marka eklenir", r.durum === 201 && r.json.logo === null, JSON.stringify(r.json));
  const markaId = r.json?.id;
  temizlik.markalar.push(markaId);
  r = await y(`/api/panel/markalar/${markaId}/logo`, { method: "POST", form: dosyaFormu("dosya", await jpeg(1600, 400), "l.jpg", "image/jpeg") });
  check("logo yüklenir, en uzun kenar 800", r.durum === 201 && r.json.logo?.genislik === 800, JSON.stringify(r.json));

  console.log("\n# Teklif formu (herkese açık)");
  const tIp = yeniIp();
  r = await anon("/api/teklif/jeton");
  const jeton = r.json?.jeton;
  check("jeton alınır, önbelleğe alınmaz", !!jeton && r.headers.get("cache-control")?.includes("no-store"), r.headers.get("cache-control"));
  const gecerli = { ad: "Ayşe Test", telefon: "+90 (532) 111 22 33", mesaj: "Düğün çekimi için teklif almak istiyoruz.", kvkk: true, hizmet: "Drone Çekimleri", etkinlikTarihi: "2026-12-05" };
  r = await anon("/api/teklif", { method: "POST", ip: tIp, body: { ...gecerli, jeton } });
  check("3 sn dolmadan gönderilen form 400 (bot hızı)", r.durum === 400 && r.json.alan === "jeton", JSON.stringify(r.json));
  await bekle(3200);
  r = await anon("/api/teklif", { method: "POST", body: { ...gecerli, jeton: jeton.slice(0, -2) + "xx" } });
  check("imzası bozuk jeton 400", r.durum === 400 && r.json.alan === "jeton", JSON.stringify(r.json));
  r = await anon("/api/teklif", { method: "POST", body: { ...gecerli, jeton: `${Date.now() - 25 * 3600e3}.${"a".repeat(43)}` } });
  check("uydurma eski jeton 400", r.durum === 400);
  r = await anon("/api/teklif", { method: "POST", body: { ...gecerli, kvkk: false, jeton } });
  check("KVKK onayı yoksa 400", r.durum === 400 && r.json.alan === "kvkk", JSON.stringify(r.json));
  r = await anon("/api/teklif", { method: "POST", body: { ...gecerli, telefon: "123", jeton } });
  check("geçersiz telefon 400", r.durum === 400 && r.json.alan === "telefon", JSON.stringify(r.json));
  r = await anon("/api/teklif", { method: "POST", body: { ...gecerli, etkinlikTarihi: "2026-02-30", jeton } });
  check("takvimde olmayan tarih 400", r.durum === 400, JSON.stringify(r.json));
  let once = (await y("/api/panel/teklifler")).json.toplam;
  r = await anon("/api/teklif", { method: "POST", body: { ...gecerli, web_sitesi: "http://spam.example", jeton } });
  check("bal küpü dolu: bota 201 döner", r.durum === 201);
  check("bal küpü dolu: kayıt YAZILMAZ", (await y("/api/panel/teklifler")).json.toplam === once);
  r = await anon("/api/teklif", { method: "POST", body: { ...gecerli, jeton } });
  check("geçerli talep 201", r.durum === 201, JSON.stringify(r.json));
  r = await y("/api/panel/teklifler?durum=YENI");
  const talep = r.json.talepler?.[0];
  check("talep panelde YENI, telefon normalleştirilmiş", talep?.ad === "Ayşe Test" && talep?.telefon === "05321112233" && talep?.durum === "YENI", JSON.stringify(talep));
  check("WhatsApp dönüş bağlantısı hazır mesajlı", talep?.whatsappLinki?.startsWith("https://wa.me/905321112233?text="), talep?.whatsappLinki);
  check("etkinlik tarihi kaymadan yazılır (5 Aralık)", talep?.etkinlikTarihiMetni?.startsWith("5 Aralık 2026"), talep?.etkinlikTarihiMetni);
  check("sıfır adetli durumlar da listede", r.json.durumlar.length === 5 && r.json.durumlar.some((d) => d.adet === 0), JSON.stringify(r.json.durumlar));
  r = await y(`/api/panel/teklifler/${talep.id}`, { method: "PATCH", body: { durum: "ARANDI", icNot: "Perşembe dönülecek" } });
  check("talep durumu ve iç notu değişir", r.durum === 200 && r.json.durum === "ARANDI" && r.json.icNot === "Perşembe dönülecek");
  r = await y(`/api/panel/teklifler/${talep.id}`, { method: "PATCH", body: { durum: "SILINDI" } });
  check("geçersiz durum 400", r.durum === 400);

  const sinirIp = yeniIp();
  const durumlar = [];
  for (let i = 0; i < 6; i++) durumlar.push((await anon("/api/teklif", { method: "POST", ip: sinirIp, body: { ...gecerli, telefon: "12", jeton } })).durum);
  check("aynı IP'den saatte 6. talep 429 (bozuk istekler de sayılır)", durumlar.slice(0, 5).every((d) => d === 400) && durumlar[5] === 429, JSON.stringify(durumlar));

  console.log("\n# Denetim izi");
  r = await y("/api/panel/kayitlar");
  const eylemler = new Set(r.json.kayitlar.map((k) => k.eylem));
  check("denetim izinde giriş, ayar, proje, foto, teklif kayıtları var",
    ["GIRIS", "GIRIS_HATALI", "AYAR_DEGISTI", "PROJE_EKLE", "PROJE_DUZENLE", "FOTO_EKLE", "TEKLIF_GELDI", "TEKLIF_BOT", "TEKLIF_RED"].every((e) => eylemler.has(e)),
    JSON.stringify([...eylemler]));
  const ayarKaydi = r.json.kayitlar.find((k) => k.eylem === "AYAR_DEGISTI" && k.detay.includes("telefon"));
  check("ayar değişikliği eski → yeni yazılır", !!ayarKaydi && ayarKaydi.detay.includes("→ 05321234567"), ayarKaydi?.detay);

  console.log("\n# Şifre değişince diğer cihaz düşer");
  r = await y("/api/panel/sifre", { method: "POST", body: { eskiSifre: "yanlis", yeniSifre: "gecici-sifre-123" } });
  check("yanlış mevcut şifre 400", r.durum === 400 && r.json.alan === "eskiSifre");
  r = await y("/api/panel/sifre", { method: "POST", body: { eskiSifre: SIFRE, yeniSifre: "gecici-sifre-123" } });
  check("şifre değişir", r.durum === 200, JSON.stringify(r.json));
  check("değiştiren cihazın oturumu sürer", (await y("/api/panel/ben")).durum === 200);
  check("ikinci cihazın oturumu düşer 401", (await y2("/api/panel/ben")).durum === 401);
  r = await y("/api/panel/sifre", { method: "POST", body: { eskiSifre: "gecici-sifre-123", yeniSifre: SIFRE } });
  check("şifre eski hâline döner", r.durum === 200, `${JSON.stringify(r.json)} — 'SIFRE=${SIFRE} npx tsx tools/yonetici-ac.ts yonetici' ile sıfırlayın`);

  console.log("\n# Silme ve temizlik");
  r = await y(`/api/panel/projeler/${p1.id}`, { method: "DELETE" });
  check("proje silinir", r.durum === 200);
  r = await y(`/api/panel/fotolar?proje=${p1.id}`);
  check("projenin fotoğraf kayıtları da gider (Cascade)", r.json.toplam === 0);
  temizlik.projeler = temizlik.projeler.filter((id) => id !== p1.id);

  for (const id of temizlik.projeler) await y(`/api/panel/projeler/${id}`, { method: "DELETE" });
  for (const id of temizlik.hizmetler) await y(`/api/panel/hizmetler/${id}`, { method: "DELETE" });
  for (const id of temizlik.markalar) await y(`/api/panel/markalar/${id}`, { method: "DELETE" });
  for (const id of temizlik.fotolar) await y(`/api/panel/fotolar/${id}`, { method: "DELETE" });
  await y("/api/panel/ayarlar", { method: "PATCH", body: eskiAyar });
  await y(`/api/panel/teklifler/${talep.id}`, { method: "PATCH", body: { durum: "KAPANDI", icNot: "otomatik test kaydı" } });

  console.log(`\n${gecen} geçti, ${kalan} kaldı`);
  process.exit(kalan ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
