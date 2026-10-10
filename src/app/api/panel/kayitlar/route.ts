// GET /api/panel/kayitlar?sayfa=1&eylem=GIRIS_HATALI — denetim izi
// Sayfalı; toplam ayrı bir count'tan gelir (rehber §7.16/86).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { hata } from "@/lib/http";
import { tarihSaat } from "@/lib/tarih";

const SAYFA_BOYU = 50;

export async function GET(req: Request) {
  const g = await guard();
  if (g.hata) return g.hata;
  const q = new URL(req.url).searchParams;
  const sayfa = Number(q.get("sayfa") || 1);
  if (!Number.isInteger(sayfa) || sayfa < 1 || sayfa > 10000) return hata(400, "Geçersiz sayfa");
  const eylem = q.get("eylem");
  if (eylem && !/^[A-Z_]{2,40}$/.test(eylem)) return hata(400, "Geçersiz eylem");
  const where = eylem ? { eylem } : {};
  const [toplam, kayitlar] = await Promise.all([
    prisma.islemKaydi.count({ where }),
    prisma.islemKaydi.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (sayfa - 1) * SAYFA_BOYU,
      take: SAYFA_BOYU,
      include: { yonetici: { select: { ad: true } } },
    }),
  ]);
  return NextResponse.json({
    toplam,
    sayfa,
    sayfaBoyu: SAYFA_BOYU,
    kayitlar: kayitlar.map((k) => ({
      id: k.id, tarih: k.tarih.toISOString(), tarihMetni: tarihSaat(k.tarih),
      kim: k.yonetici?.ad ?? (k.yoneticiId ? `#${k.yoneticiId}` : "Ziyaretçi / sistem"),
      eylem: k.eylem, detay: k.detay, ip: k.ip,
    })),
  });
}
