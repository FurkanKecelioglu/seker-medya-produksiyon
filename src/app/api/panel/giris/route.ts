// POST /api/panel/giris — panel girişi.
// Deneme sayacı IP + kullanıcı adı ikilisiyle: yalnız kullanıcı adına göre sayılsa
// saldırgan yöneticinin hesabını kilitleyerek siteyi panelsiz bırakabilirdi (rehber §5.3).
// Başarılı ve başarısız her giriş kaydedilir; yanlış şifrede yalnız karakter sayısı
// yazılır (rehber §7.7/43 — "giremiyorum" arızasında iz olmalı).
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { govdeAyristir, hata, istemciIp } from "@/lib/http";
import { hizSiniri, hizSiniriSifirla } from "@/lib/hizSiniri";
import { kullaniciAdiNormallestir } from "@/lib/kimlik";
import { oturumAc } from "@/lib/oturum";
import { log } from "@/lib/log";

const sema = z.object({
  kullaniciAdi: z.string().min(1, "Kullanıcı adını yazın").max(60),
  sifre: z.string().min(1, "Şifreyi yazın").max(200),
});

// Kullanıcı yokken de bcrypt karşılaştırması yapılır ki cevap süresi
// "böyle bir kullanıcı var mı" sorusunu ele vermesin.
const SAHTE_OZET = bcrypt.hashSync("kullanici-yok", 10);

export async function POST(req: Request) {
  const ip = istemciIp(req);
  const b = await govdeAyristir(req, sema);
  if (b.hata) return b.hata;
  const ad = kullaniciAdiNormallestir(b.veri.kullaniciAdi);

  const bekleIp = hizSiniri(`giris-ip:${ip}`, 30, 900);
  const bekleKisi = hizSiniri(`giris:${ip}:${ad}`, 6, 900);
  const bekle = bekleIp ?? bekleKisi;
  if (bekle) {
    await log(null, "GIRIS_ENGEL", `${ad} — hız sınırı`, ip);
    return hata(429, `Çok fazla deneme. ${Math.ceil(bekle / 60)} dakika sonra tekrar deneyin.`, { tekrarSn: bekle });
  }

  const y = await prisma.yonetici.findUnique({ where: { kullaniciAdi: ad } });
  const dogru = await bcrypt.compare(b.veri.sifre, y?.sifreHash ?? SAHTE_OZET);
  if (!y || !dogru) {
    await log(y?.id ?? null, "GIRIS_HATALI", `${ad} — ${y ? `yanlış şifre (${b.veri.sifre.length} karakter)` : "kullanıcı yok"}`, ip);
    return hata(401, "Kullanıcı adı ya da şifre hatalı");
  }
  if (!y.aktif) {
    await log(y.id, "GIRIS_HATALI", `${ad} — hesap pasif`, ip);
    return hata(403, "Bu hesap pasif. Siteyi kuran kişiyle görüşün.");
  }

  hizSiniriSifirla(`giris:${ip}:${ad}`);
  await oturumAc(y.id, y.oturumNo);
  await log(y.id, "GIRIS", ad, ip);
  return NextResponse.json({ id: y.id, ad: y.ad });
}
