// GET  /api/panel/projeler — bütün projeler (taslaklar dahil), sırayla
// POST /api/panel/projeler { baslik, kategori, ozet, slug?, musteri?, yil?, aciklama?, videoAdresi?, oneCikan?, yayinda? }
// Yeni proje varsayılan olarak TASLAK: kapak ve fotoğraflar yüklenmeden sitede yarım görünmesin.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { govdeAyristir, istemciIp, yakala } from "@/lib/http";
import { projeSemasi } from "@/lib/semalar";
import { projeGorunumu, slugBelirle, videoAlanlari } from "@/lib/projeler";
import { ONE_CIKAN_SAYISI } from "@/lib/vitrin";
import { log } from "@/lib/log";

export async function GET() {
  const g = await guard();
  if (g.hata) return g.hata;
  const projeler = await prisma.proje.findMany({
    orderBy: [{ sira: "asc" }, { id: "desc" }],
    include: { _count: { select: { fotolar: true } } },
  });
  return NextResponse.json({
    projeler: projeler.map(projeGorunumu),
    /** Ana sayfada kaç öne çıkan görünür — panel fazlası işaretlenince uyarı gösterir */
    oneCikanSiniri: ONE_CIKAN_SAYISI,
  });
}

export async function POST(req: Request) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const b = await govdeAyristir(req, projeSemasi);
    if (b.hata) return b.hata;
    const { slug, videoAdresi, ...alanlar } = b.veri;
    const veri = {
      ...alanlar,
      ...videoAlanlari(videoAdresi),
      slug: await slugBelirle(slug, alanlar.baslik),
      yayinda: alanlar.yayinda ?? false,
    };
    // Yeni proje listenin BAŞINA: en son iş genelde en çok gösterilmek istenen iştir
    const ilk = await prisma.proje.aggregate({ _min: { sira: true } });
    const p = await prisma.proje.create({ data: { ...veri, sira: (ilk._min.sira ?? 1) - 1 } });
    await log(g.kullanici.id, "PROJE_EKLE", `#${p.id} ${p.baslik} (${p.kategori}, ${p.yayinda ? "yayında" : "taslak"})`, istemciIp(req));
    return NextResponse.json(projeGorunumu(p), { status: 201 });
  });
}
