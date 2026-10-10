// Panel hesabı açar ya da şifresini sıfırlar. Panelde "hesap aç" ekranı yok
// (karar 0003): siteyi kuran kişi canlıda ilk hesabı ve unutulan şifreyi bununla yönetir.
//
//   npx tsx tools/yonetici-ac.ts <kullaniciAdi> ["Görünen Ad"]
//
// - Hesap yoksa açar, varsa şifresini sıfırlar ve hesabı aktif eder.
// - Şifre rastgele üretilir ve YALNIZ BİR KEZ ekrana yazılır. (Yerelde testler için
//   SIFRE=... ortam değişkeniyle verilebilir.)
// - Sıfırlamada oturum numarası artar: o hesabın açık bütün oturumları düşer.
// - Denetim izine yazar: kayıt panelden geçmese de iz kalsın.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { kullaniciAdiNormallestir, rastgeleSifre } from "../src/lib/kimlik";

async function main() {
  const [hamAd, gorunen] = process.argv.slice(2);
  if (!hamAd) throw new Error('Kullanım: npx tsx tools/yonetici-ac.ts <kullaniciAdi> ["Görünen Ad"]');
  const kullaniciAdi = kullaniciAdiNormallestir(hamAd);
  if (!/^[a-z0-9._-]{3,40}$/.test(kullaniciAdi)) {
    throw new Error("Kullanıcı adı 3-40 karakter; yalnız harf, rakam, nokta, tire, alt çizgi");
  }
  // Hedefi ilk satırda yaz: yanlış veritabanına yazmak sessiz olmasın (rehber §7.7/45)
  console.log(`Hedef: ${(process.env.DATABASE_URL || "").replace(/:[^:@/]*@/, ":****@")}`);

  const sifre = process.env.SIFRE || rastgeleSifre(14);
  if (sifre.length < 10) throw new Error("Şifre en az 10 karakter olmalı");
  const sifreHash = await bcrypt.hash(sifre, 10);

  const var_ = await prisma.yonetici.findUnique({ where: { kullaniciAdi } });
  if (var_) {
    await prisma.yonetici.update({ where: { id: var_.id }, data: { sifreHash, aktif: true, oturumNo: { increment: 1 } } });
    await prisma.islemKaydi.create({ data: { eylem: "HESAP_SIFIRLA", detay: `${kullaniciAdi} — araçla şifre sıfırlandı` } });
    console.log(`${kullaniciAdi}: şifre sıfırlandı, açık oturumları kapatıldı`);
  } else {
    const y = await prisma.yonetici.create({ data: { ad: gorunen || kullaniciAdi, kullaniciAdi, sifreHash } });
    await prisma.islemKaydi.create({ data: { eylem: "HESAP_AC", detay: `#${y.id} ${kullaniciAdi} — araçla açıldı` } });
    console.log(`${kullaniciAdi}: hesap açıldı`);
  }
  console.log(`Şifre: ${sifre}`);
  if (!process.env.SIFRE) console.log("(bu şifre bir daha gösterilmez, şimdi not edin)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e instanceof Error ? e.message : e);
    await prisma.$disconnect();
    process.exit(1);
  });
