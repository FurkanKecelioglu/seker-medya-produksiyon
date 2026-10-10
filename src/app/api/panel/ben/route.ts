// GET /api/panel/ben — oturumdaki yönetici + bekleyen (YENI) teklif sayısı.
// Panel bunu periyodik çağırabilir: yeni talep gelince menüde rozet için.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";

export async function GET() {
  const g = await guard();
  if (g.hata) return g.hata;
  const yeniTeklif = await prisma.teklifTalebi.count({ where: { durum: "YENI" } });
  return NextResponse.json({ ...g.kullanici, yeniTeklif });
}
