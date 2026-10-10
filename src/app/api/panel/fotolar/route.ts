// GET  /api/panel/fotolar?proje=<id>|galeri — bir projenin fotoğrafları ya da projesiz (yalnız galeri) fotoğraflar;
//      parametresiz: hepsi
// POST /api/panel/fotolar (multipart: dosya, projeId?, aciklama?, galeride?) — TEK fotoğraf yükler.
//      Çoklu yüklemede panel dosyaları sırayla gönderir: tek istekte 30 fotoğraf hem
//      gövde sınırına takılır hem de biri bozuksa hangisi olduğu kaybolur.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { hata, istemciIp, KuralHatasi, yakala } from "@/lib/http";
import { FOTO_BOYUTU, fotografKaydet } from "@/lib/yukleme";
import { fotoGorunumu } from "@/lib/projeler";
import { log } from "@/lib/log";

export async function GET(req: Request) {
  const g = await guard();
  if (g.hata) return g.hata;
  const q = new URL(req.url).searchParams.get("proje");
  let where = {};
  if (q === "galeri") where = { projeId: null };
  else if (q) {
    const id = Number(q);
    if (!Number.isInteger(id) || id <= 0) return hata(400, "Geçersiz proje");
    where = { projeId: id };
  }
  const fotolar = await prisma.foto.findMany({ where, orderBy: [{ sira: "asc" }, { id: "asc" }] });
  return NextResponse.json({ fotolar: fotolar.map(fotoGorunumu), toplam: fotolar.length });
}

export async function POST(req: Request) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const form = await req.formData().catch(() => null);
    if (!form) throw new KuralHatasi(400, "Form okunamadı");
    const projeHam = String(form.get("projeId") ?? "").trim();
    let projeId: number | null = null;
    if (projeHam) {
      projeId = Number(projeHam);
      if (!Number.isInteger(projeId) || projeId <= 0) throw new KuralHatasi(400, "Geçersiz proje");
      if (!(await prisma.proje.findUnique({ where: { id: projeId }, select: { id: true } }))) {
        throw new KuralHatasi(404, "Proje bulunamadı");
      }
    }
    const aciklama = String(form.get("aciklama") ?? "").trim().slice(0, 200) || null;
    // Varsayılan: galeride görünür. Panel "yalnız projede" seçerse "false" gönderir.
    const galeride = String(form.get("galeride") ?? "true") !== "false";
    const k = await fotografKaydet(form.get("dosya"), "foto", FOTO_BOYUTU.foto);
    const son = await prisma.foto.aggregate({ where: { projeId }, _max: { sira: true } });
    const f = await prisma.foto.create({
      data: { projeId, dosya: k.dosya, genislik: k.genislik, yukseklik: k.yukseklik, aciklama, galeride, sira: (son._max.sira ?? 0) + 1 },
    });
    await log(g.kullanici.id, "FOTO_EKLE", `#${f.id} ${projeId ? `proje #${projeId}` : "galeri"} ${k.dosya}`, istemciIp(req));
    return NextResponse.json(fotoGorunumu(f), { status: 201 });
  });
}
