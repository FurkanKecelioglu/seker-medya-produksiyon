// GET  /api/panel/hizmetler — bütün hizmetler (pasifler dahil) + seçilebilir ikon listesi
// POST /api/panel/hizmetler { baslik, ozet, ikon, aktif? } — yeni hizmet listenin sonuna eklenir
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { govdeAyristir, istemciIp } from "@/lib/http";
import { hizmetSemasi } from "@/lib/semalar";
import { HIZMET_IKONLARI } from "@/lib/kategoriler";
import { log } from "@/lib/log";

export async function GET() {
  const g = await guard();
  if (g.hata) return g.hata;
  const hizmetler = await prisma.hizmet.findMany({ orderBy: [{ sira: "asc" }, { id: "asc" }] });
  return NextResponse.json({ hizmetler, ikonlar: HIZMET_IKONLARI });
}

export async function POST(req: Request) {
  const g = await guard();
  if (g.hata) return g.hata;
  const b = await govdeAyristir(req, hizmetSemasi);
  if (b.hata) return b.hata;
  const son = await prisma.hizmet.aggregate({ _max: { sira: true } });
  const h = await prisma.hizmet.create({ data: { ...b.veri, sira: (son._max.sira ?? 0) + 1 } });
  await log(g.kullanici.id, "HIZMET_EKLE", `#${h.id} ${h.baslik}`, istemciIp(req));
  return NextResponse.json(h, { status: 201 });
}
