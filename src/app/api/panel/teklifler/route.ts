// GET /api/panel/teklifler?durum=YENI&sayfa=1 — teklif talepleri, en yeni önce.
// Sayfalı; toplam ayrı bir count'tan gelir (kırpılmış listenin uzunluğu toplam
// değildir — rehber §7.16/86). Durum sayıları menü rozetleri ve sekmeler için.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { hata } from "@/lib/http";
import { ayarlariOku } from "@/lib/ayarlar";
import { TEKLIF_DURUM_KODLARI, TEKLIF_DURUMLARI, type TeklifDurumKodu } from "@/lib/kategoriler";
import { teklifGorunumu } from "@/lib/teklifler";

const SAYFA_BOYU = 30;

export async function GET(req: Request) {
  const g = await guard();
  if (g.hata) return g.hata;
  const q = new URL(req.url).searchParams;
  const sayfa = Number(q.get("sayfa") || 1);
  if (!Number.isInteger(sayfa) || sayfa < 1 || sayfa > 10000) return hata(400, "Geçersiz sayfa");
  const durum = q.get("durum");
  if (durum && !TEKLIF_DURUM_KODLARI.includes(durum as TeklifDurumKodu)) return hata(400, "Geçersiz durum");
  const where = durum ? { durum: durum as TeklifDurumKodu } : {};

  const [toplam, talepler, sayilar, a] = await Promise.all([
    prisma.teklifTalebi.count({ where }),
    prisma.teklifTalebi.findMany({ where, orderBy: { id: "desc" }, skip: (sayfa - 1) * SAYFA_BOYU, take: SAYFA_BOYU }),
    prisma.teklifTalebi.groupBy({ by: ["durum"], _count: { _all: true } }),
    ayarlariOku(),
  ]);
  return NextResponse.json({
    toplam,
    sayfa,
    sayfaBoyu: SAYFA_BOYU,
    // Sıfır olan durumlar da listede: boş sekme "0" göstermeli, kaybolmamalı (rehber §1.5)
    durumlar: TEKLIF_DURUMLARI.map((d) => ({ ...d, adet: sayilar.find((s) => s.durum === d.kod)?._count._all ?? 0 })),
    talepler: talepler.map((t) => teklifGorunumu(t, a.firma_adi)),
  });
}
