// PUT /api/panel/siralama { tur: "hizmet"|"proje"|"foto"|"marka", idler: [3, 1, 2, …] }
// Sürükle-bırak sonrası yeni sırayı tek istekte kaydeder: dizideki konum = sıra.
//
// Kısmi liste kabul edilir ama karışık değil: fotoğraf sıralaması bir projenin
// (ya da projesiz galerinin) fotoğraflarının TAMAMINI içermeli. Yarım liste
// gönderilirse gönderilmeyenlerin sırası eskide kalır ve iki fotoğraf aynı sırayı
// paylaşır — ekranda hangisinin önce geleceği belirsizleşir.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { govdeAyristir, hata, istemciIp } from "@/lib/http";
import { siralamaSemasi } from "@/lib/semalar";
import { log } from "@/lib/log";

export async function PUT(req: Request) {
  const g = await guard();
  if (g.hata) return g.hata;
  const b = await govdeAyristir(req, siralamaSemasi);
  if (b.hata) return b.hata;
  const { tur, idler } = b.veri;

  // Hepsi aynı türden VE eksiksiz mi? Tür başına "kapsam": foto için aynı proje grubu.
  let kapsam: number[];
  if (tur === "foto") {
    const ilk = await prisma.foto.findUnique({ where: { id: idler[0] }, select: { projeId: true } });
    if (!ilk) return hata(404, "Fotoğraf bulunamadı");
    kapsam = (await prisma.foto.findMany({ where: { projeId: ilk.projeId }, select: { id: true } })).map((x) => x.id);
  } else if (tur === "hizmet") {
    kapsam = (await prisma.hizmet.findMany({ select: { id: true } })).map((x) => x.id);
  } else if (tur === "proje") {
    kapsam = (await prisma.proje.findMany({ select: { id: true } })).map((x) => x.id);
  } else {
    kapsam = (await prisma.marka.findMany({ select: { id: true } })).map((x) => x.id);
  }
  const k = new Set(kapsam);
  if (idler.length !== k.size || !idler.every((id) => k.has(id))) {
    return hata(400, "Sıralama listesi eksik ya da başka kayıtlar içeriyor. Sayfayı yenileyip tekrar deneyin.");
  }

  const islemler = idler.map((id, i) => {
    const veri = { where: { id }, data: { sira: i + 1 } };
    if (tur === "foto") return prisma.foto.update(veri);
    if (tur === "hizmet") return prisma.hizmet.update(veri);
    if (tur === "proje") return prisma.proje.update(veri);
    return prisma.marka.update(veri);
  });
  await prisma.$transaction(islemler);
  await log(g.kullanici.id, "SIRALAMA", `${tur}: ${idler.join(",")}`, istemciIp(req));
  return NextResponse.json({ ok: true });
}
