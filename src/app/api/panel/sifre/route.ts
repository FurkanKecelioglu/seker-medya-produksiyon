// POST /api/panel/sifre { eskiSifre, yeniSifre }
// Oturum numarası artar: diğer cihazlardaki oturumlar düşer (çalınan/unutulan
// telefondaki oturum böylece kapanır); bu cihazın oturumu yeni numarayla yenilenir.
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { govdeAyristir, hata, istemciIp } from "@/lib/http";
import { hizSiniri } from "@/lib/hizSiniri";
import { oturumAc } from "@/lib/oturum";
import { log } from "@/lib/log";

const sema = z.object({
  eskiSifre: z.string().min(1, "Mevcut şifreyi yazın").max(200),
  yeniSifre: z.string().min(10, "Yeni şifre en az 10 karakter").max(200),
});

export async function POST(req: Request) {
  const g = await guard();
  if (g.hata) return g.hata;
  const ip = istemciIp(req);
  // Oturumu ele geçiren biri mevcut şifreyi deneme-yanılmayla bulmasın
  const bekle = hizSiniri(`sifre:${g.kullanici.id}`, 6, 900);
  if (bekle) return hata(429, `Çok fazla deneme. ${Math.ceil(bekle / 60)} dakika sonra tekrar deneyin.`);
  const b = await govdeAyristir(req, sema);
  if (b.hata) return b.hata;
  const y = await prisma.yonetici.findUniqueOrThrow({ where: { id: g.kullanici.id } });
  if (!(await bcrypt.compare(b.veri.eskiSifre, y.sifreHash))) {
    await log(y.id, "SIFRE_HATALI", "mevcut şifre yanlış", ip);
    return hata(400, "Mevcut şifre yanlış", { alan: "eskiSifre" });
  }
  if (b.veri.eskiSifre === b.veri.yeniSifre) return hata(400, "Yeni şifre eskisiyle aynı olamaz", { alan: "yeniSifre" });
  const yeni = await prisma.yonetici.update({
    where: { id: y.id },
    data: { sifreHash: await bcrypt.hash(b.veri.yeniSifre, 10), oturumNo: { increment: 1 } },
  });
  await oturumAc(yeni.id, yeni.oturumNo);
  await log(y.id, "SIFRE_DEGISTI", "diğer oturumlar kapatıldı", ip);
  return NextResponse.json({ ok: true });
}
