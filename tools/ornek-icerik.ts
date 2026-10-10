// YALNIZ YEREL: tasarım yapılırken sitenin boş görünmemesi için örnek içerik.
//
//   npx tsx tools/ornek-icerik.ts            (dev açıkken; SIFRE yoksa .env'deki SEED_SIFRE_YONETICI)
//
// - Veriyi veritabanına SQL'le değil, panelin kullandığı API'den yazar: doğrulama, slug,
//   görsel işleme ve denetim izi gerçek yoldan geçer.
// - Projeler Çankırı Postası'nın YouTube'daki gerçek işleri (Ercan Şeker'in yapımları);
//   galeri ve bölüm görselleri bu videoların karelerinden. Marka logoları uydurma ("Örnek Kurum").
//   Canlıya ÇIKMAZ: SITE_URL https ise araç durur. Kurum adları/logoları izinsiz siteye konmaz.
// - Tekrar çalıştırılırsa aynı başlıklı projeyi ve aynı adlı markayı ikinci kez eklemez.
import "dotenv/config";
import sharp from "sharp";

const URL_ = process.env.TEST_URL || "http://localhost:3060";
const SIFRE = process.env.SIFRE || process.env.SEED_SIFRE_YONETICI || "";

if ((process.env.SITE_URL || "").startsWith("https://")) {
  console.error("SITE_URL https — bu canlı ortam gibi görünüyor, örnek içerik eklenmedi.");
  process.exit(1);
}

type Kategori = "VIDEO" | "FOTOGRAF" | "DRONE" | "CANLI_YAYIN" | "TV";
const PROJELER: Array<{
  baslik: string; kategori: Kategori; youtube: string; musteri?: string; yil: number; oneCikan: boolean;
  ozet: string; aciklama: string;
}> = [
  {
    baslik: "Gündem Özel — Çankırı Belediye Başkanı", kategori: "TV", youtube: "Zk9QkH67kus", yil: 2026, oneCikan: true,
    musteri: "Çankırı Postası TV",
    ozet: "Radyo Neşe ortak yapımı, iki kameralı stüdyo programı.",
    aciklama: "Haftalık Gündem Özel programının bir bölümü. Stüdyo ışığı, iki kamera ve canlı reji ile YouTube ve "
      + "Facebook'ta eş zamanlı yayınlandı, ardından kurgulanıp arşive alındı.",
  },
  {
    baslik: "Çankırı FK — Maç Yayını", kategori: "CANLI_YAYIN", youtube: "qxJSxd7iVm0", yil: 2026, oneCikan: true,
    musteri: "Çankırı FK",
    ozet: "Çok kameralı canlı maç yayını ve gol özetleri.",
    aciklama: "Saha kenarı ve tribün kameralarıyla canlı yayın; maç sonunda gol kurgusu aynı gün paylaşıldı.",
  },
  {
    baslik: "Pascal Nouma Çankırı'da", kategori: "VIDEO", youtube: "LG8ZNDweM-Y", yil: 2026, oneCikan: true,
    ozet: "Etkinlik ve karşılama çekimi, aynı gün kurgu.",
    aciklama: "Karşılama töreni, röportajlar ve kalabalık çekimleri tek bir hikâyede kurgulandı.",
  },
  {
    baslik: "Ilgaz Zirvesi — \"Korkma\"", kategori: "DRONE", youtube: "kINGizRKPTw", yil: 2026, oneCikan: true,
    ozet: "2.200 metrede havadan ve yerden çekim.",
    aciklama: "Ilgaz Dağı'nın zirvesinde yazılan dev mesajın havadan görüntüleri.",
  },
  {
    baslik: "Gündem Özel — ÇANDEF Genel Başkanı", kategori: "TV", youtube: "ag1UXTsRcmE", yil: 2026, oneCikan: true,
    musteri: "Çankırı Postası TV",
    ozet: "Canlı söyleşi programı, iki kamera.",
    aciklama: "Canlı yayınlanan söyleşi programı; kayıt sonradan kurgulanıp YouTube arşivine eklendi.",
  },
  {
    baslik: "ÇAKÜ — Dedublüman Konseri", kategori: "VIDEO", youtube: "kU_G1gJHJrc", yil: 2026, oneCikan: true,
    musteri: "Çankırı Karatekin Üniversitesi",
    ozet: "Konser çekimi ve sosyal medya kurgusu.",
    aciklama: "Sahne ve seyirci kameralarıyla konser kaydı; dikey sosyal medya kesitleri.",
  },
  {
    baslik: "Ankara'da Yaren Ocağı", kategori: "VIDEO", youtube: "j53aDvLxMdw", yil: 2026, oneCikan: false,
    ozet: "Geleneksel Çankırı yaren ocağı belgesel çekimi.",
    aciklama: "Yaren ocağı geleneğinin Ankara'daki buluşmasından kültür kaydı.",
  },
  {
    baslik: "Çankırı'da Kar", kategori: "FOTOGRAF", youtube: "P5FQwbVNLO4", yil: 2026, oneCikan: false,
    ozet: "Şehirden kış kareleri.",
    aciklama: "Akşam saatlerinde bastıran karın şehirdeki görüntüleri.",
  },
];

let cerez = "";
async function api(yol: string, init: { method?: string; json?: unknown; form?: FormData } = {}) {
  const headers: Record<string, string> = {};
  if (cerez) headers.cookie = cerez;
  let body: BodyInit | undefined;
  if (init.form) body = init.form;
  else if (init.json !== undefined) { headers["content-type"] = "application/json"; body = JSON.stringify(init.json); }
  const r = await fetch(URL_ + yol, { method: init.method || "GET", headers, body });
  const sc = r.headers.get("set-cookie");
  if (sc) cerez = sc.split(";")[0];
  const veri = r.headers.get("content-type")?.includes("json") ? await r.json() : null;
  if (!r.ok) throw new Error(`${init.method || "GET"} ${yol} → ${r.status} ${JSON.stringify(veri)}`);
  return veri;
}

/** YouTube karesi: maxres yoksa (eski/kısa videolar) hq'ya düşer */
async function kare(kimlik: string): Promise<Buffer> {
  for (const ad of ["maxresdefault", "hqdefault"]) {
    const r = await fetch(`https://i.ytimg.com/vi/${kimlik}/${ad}.jpg`);
    if (r.ok) return Buffer.from(await r.arrayBuffer());
  }
  throw new Error(`küçük resim alınamadı: ${kimlik}`);
}

function dosya(veri: Buffer, ad: string, tur: string) {
  const f = new FormData();
  f.append("dosya", new Blob([new Uint8Array(veri)], { type: tur }), ad);
  return f;
}

/** Uydurma marka logosu: şeffaf zemin, beyaz yazı — logo şeridinin nasıl durduğunu görmek için */
async function logo(metin: string): Promise<Buffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="160">
    <text x="240" y="98" font-family="Arial, sans-serif" font-size="46" font-weight="700"
      fill="#ffffff" text-anchor="middle">${metin}</text></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function main() {
  if (!SIFRE) throw new Error("Şifre yok: SIFRE=... ya da .env'de SEED_SIFRE_YONETICI");
  console.log(`Hedef: ${URL_}`);
  await api("/api/panel/giris", { method: "POST", json: { kullaniciAdi: "yonetici", sifre: SIFRE } });

  // Ayarlar: yalnız boş olanlar doldurulur — elle girilmiş değer ezilmez
  const ayar = await api("/api/panel/ayarlar");
  const istenen: Record<string, string> = {
    telefon: "0532 123 45 67",
    whatsapp: "0532 123 45 67",
    eposta: "info@ornek-sekermedya.com",
    adres: "Cumhuriyet Mh., Merkez / Çankırı",
    instagram: "@sekermedya",
    youtube: "@cankiripostasi",
    showreel: "https://www.youtube.com/watch?v=LG8ZNDweM-Y",
    // Rakamsız: yıl/iş sayısı firmaya teyit ettirilmeden yazılmaz
    guven_satiri: "Canlı yayın · TV programı · Drone · Kurgu ve post prodüksiyon",
    canli_yayin_metni: "Maç, tören, konferans ve programlarda çok kameralı reji; YouTube, Facebook ve televizyona eş zamanlı yayın.",
    drone_metni: "Şehir, doğa, tesis ve etkinlikleri havadan; tanıtım filmleri için sinematik hava çekimleri.",
    cagri_metni: "Çekim tarihinizi ve ihtiyacınızı yazın, aynı gün dönüş yapalım.",
    hakkimizda: "Örnek metin — firmadan gelecek. Ulusal ajans muhabirliğinden yerel yayıncılığa uzanan yirmi yılı aşkın "
      + "saha deneyimiyle kurumlar, kulüpler ve markalar için video, canlı yayın ve program prodüksiyonu yapıyoruz.",
  };
  const yazilacak = Object.fromEntries(Object.entries(istenen).filter(([k]) => !ayar.metin[k]?.trim()));
  if (Object.keys(yazilacak).length) await api("/api/panel/ayarlar", { method: "PATCH", json: yazilacak });
  console.log(`  ayarlar: ${Object.keys(yazilacak).length} alan dolduruldu`);

  // Bölüm görselleri: video kareleri
  const medya: Array<[string, string]> = [
    ["acilis_posteri", "LG8ZNDweM-Y"],
    ["canli_yayin_gorseli", "qxJSxd7iVm0"],
    ["drone_gorseli", "kINGizRKPTw"],
    ["hakkimizda_gorseli", "Zk9QkH67kus"],
  ];
  for (const [anahtar, kimlik] of medya) {
    if (ayar.medya[anahtar]) continue;
    await api(`/api/panel/ayarlar/medya/${anahtar}`, { method: "POST", form: dosya(await kare(kimlik), `${anahtar}.jpg`, "image/jpeg") });
    console.log(`  ${anahtar}: yüklendi`);
  }

  // Projeler
  const { projeler: mevcut } = await api("/api/panel/projeler");
  for (const p of PROJELER) {
    if (mevcut.some((m: { baslik: string }) => m.baslik === p.baslik)) continue;
    const yeni = await api("/api/panel/projeler", {
      method: "POST",
      json: {
        baslik: p.baslik, kategori: p.kategori, ozet: p.ozet, aciklama: p.aciklama, musteri: p.musteri, yil: p.yil,
        videoAdresi: `https://www.youtube.com/watch?v=${p.youtube}`, oneCikan: p.oneCikan, yayinda: true,
      },
    });
    // Galeriye video karesi: proje sayfasında ve galeride fotoğraf görünsün
    const f = dosya(await kare(p.youtube), `${p.youtube}.jpg`, "image/jpeg");
    f.append("projeId", String(yeni.id));
    f.append("aciklama", p.baslik);
    await api("/api/panel/fotolar", { method: "POST", form: f });
    console.log(`  proje: ${p.baslik}`);
  }

  // Markalar (uydurma)
  const { markalar } = await api("/api/panel/markalar");
  for (let i = 1; i <= 6; i++) {
    const ad = `Örnek Kurum ${i}`;
    if (markalar.some((m: { ad: string }) => m.ad === ad)) continue;
    const f = new FormData();
    f.append("ad", ad);
    f.append("logo", new Blob([new Uint8Array(await logo(`KURUM ${i}`))], { type: "image/png" }), `kurum-${i}.png`);
    await api("/api/panel/markalar", { method: "POST", form: f });
  }
  console.log("  markalar: 6 örnek");
  console.log("Tamam.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
