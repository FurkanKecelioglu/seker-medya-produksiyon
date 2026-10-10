// İlk kurulum verisi: bir panel hesabı ve raporun 8 hizmeti.
//
// - Var olan kaydın üzerine YAZMAZ: tekrar çalıştırılırsa yalnız eksikleri ekler,
//   mevcut hesabın şifresi asla ezilmez (rehber §10.2).
// - Şifre SEED_SIFRE_YONETICI'den gelir; yoksa rastgele üretilip YALNIZ BİR KEZ
//   ekrana yazılır (canlıda bu yol: şifreyi kuran kişi o an not eder).
// - Proje/marka/görsel EKLEMEZ: örnek proje canlıda unutulursa gerçek iş gibi
//   görünür. Yerelde tasarım için örnek içerik ayrı bir araçla eklenecek (Görev 01 öncesi).
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { rastgeleSifre } from "../src/lib/kimlik";

// Rapor §3 — sıra raporla aynı. Kısa metinler örnektir, panelden değişir.
const HIZMETLER = [
  { baslik: "Video Prodüksiyon", ikon: "Clapperboard", ozet: "Kurumsal tanıtım, reklam ve etkinlik filmleri; senaryodan teslime kadar." },
  { baslik: "TV ve Program Prodüksiyonu", ikon: "Tv", ozet: "Stüdyo ve dış çekim programları, format geliştirme ve yayın teslimi." },
  { baslik: "Çok Kameralı Canlı Yayın", ikon: "Radio", ozet: "Konferans, tören ve konserlerde çok kameralı, rejili canlı yayın." },
  { baslik: "Drone Çekimleri", ikon: "Plane", ozet: "Lisanslı pilotla havadan video ve fotoğraf çekimi." },
  { baslik: "Profesyonel Fotoğraf", ikon: "Camera", ozet: "Ürün, mekân, etkinlik ve kurumsal portre çekimleri." },
  { baslik: "Röportaj ve Söyleşi", ikon: "Mic", ozet: "Işığı ve sesi kurulmuş, çok kameralı röportaj çekimleri." },
  { baslik: "Sosyal Medya İçerikleri", ikon: "Smartphone", ozet: "Dikey video, kısa içerik ve kampanya serileri." },
  { baslik: "Kurgu ve Post Prodüksiyon", ikon: "Scissors", ozet: "Kurgu, renk düzenleme, ses miksajı ve grafik." },
];

async function main() {
  // Hedefi ilk satırda yaz: yanlış veritabanına yazmak sessiz olmasın (rehber §7.7/45)
  const hedef = (process.env.DATABASE_URL || "").replace(/:[^:@/]*@/, ":****@");
  if (!hedef) throw new Error("DATABASE_URL yok — seed durduruldu");
  console.log(`Hedef: ${hedef}`);

  const var_ = await prisma.yonetici.findUnique({ where: { kullaniciAdi: "yonetici" } });
  if (var_) {
    console.log("  yonetici: zaten var, dokunulmadı");
  } else {
    const sifre = process.env.SEED_SIFRE_YONETICI || rastgeleSifre(14);
    await prisma.yonetici.create({
      data: { ad: "Yönetici", kullaniciAdi: "yonetici", sifreHash: await bcrypt.hash(sifre, 10) },
    });
    console.log(`  yonetici açıldı — şifre: ${sifre}`);
    if (!process.env.SEED_SIFRE_YONETICI) console.log("  (bu şifre bir daha gösterilmez, şimdi not edin)");
  }

  if ((await prisma.hizmet.count()) === 0) {
    await prisma.hizmet.createMany({ data: HIZMETLER.map((h, i) => ({ ...h, sira: i + 1 })) });
    console.log(`  ${HIZMETLER.length} hizmet eklendi`);
  } else {
    console.log("  hizmetler zaten var, dokunulmadı");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
