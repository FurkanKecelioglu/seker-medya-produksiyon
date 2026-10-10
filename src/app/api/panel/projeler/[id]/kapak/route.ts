// POST   /api/panel/projeler/<id>/kapak (multipart: dosya) — kapak yükler / değiştirir
// DELETE /api/panel/projeler/<id>/kapak — kapağı kaldırır (videonun küçük resmine düşer)
// Eski dosya, yeni kayıt yazıldıktan SONRA silinir.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { hata, istemciIp, kimlikAyristir, KuralHatasi, yakala } from "@/lib/http";
import { dosyaSil, FOTO_BOYUTU, fotografKaydet, yuklemeAdresi } from "@/lib/yukleme";
import { log } from "@/lib/log";

export async function POST(req: Request, ctx: RouteContext<"/api/panel/projeler/[id]/kapak">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const id = kimlikAyristir((await ctx.params).id);
    const p = await prisma.proje.findUnique({ where: { id } });
    if (!p) return hata(404, "Proje bulunamadı");
    const form = await req.formData().catch(() => null);
    if (!form) throw new KuralHatasi(400, "Form okunamadı");
    const k = await fotografKaydet(form.get("dosya"), "kapak", FOTO_BOYUTU.kapak);
    await prisma.proje.update({ where: { id }, data: { kapak: k.dosya, kapakGenislik: k.genislik, kapakYukseklik: k.yukseklik } });
    await dosyaSil(p.kapak);
    await log(g.kullanici.id, "PROJE_KAPAK", `#${id} ${p.baslik}: ${p.kapak ?? "—"} → ${k.dosya}`, istemciIp(req));
    return NextResponse.json({ url: yuklemeAdresi(k.dosya), genislik: k.genislik, yukseklik: k.yukseklik }, { status: 201 });
  });
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/panel/projeler/[id]/kapak">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const id = kimlikAyristir((await ctx.params).id);
    const p = await prisma.proje.findUnique({ where: { id } });
    if (!p) return hata(404, "Proje bulunamadı");
    if (!p.kapak) return hata(404, "Projenin kapağı yok");
    await prisma.proje.update({ where: { id }, data: { kapak: null, kapakGenislik: null, kapakYukseklik: null } });
    await dosyaSil(p.kapak);
    await log(g.kullanici.id, "PROJE_KAPAK", `#${id} ${p.baslik}: ${p.kapak} → —`, istemciIp(req));
    return NextResponse.json({ ok: true });
  });
}
