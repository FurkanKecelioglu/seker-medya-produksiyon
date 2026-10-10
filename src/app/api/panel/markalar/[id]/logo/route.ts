// POST   /api/panel/markalar/<id>/logo (multipart: dosya) — logo yükler / değiştirir
// DELETE /api/panel/markalar/<id>/logo — logoyu kaldırır (ad yazı olarak görünür)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { hata, istemciIp, kimlikAyristir, KuralHatasi, yakala } from "@/lib/http";
import { dosyaSil, FOTO_BOYUTU, fotografKaydet } from "@/lib/yukleme";
import { markaGorunumu } from "@/lib/markalar";
import { log } from "@/lib/log";

export async function POST(req: Request, ctx: RouteContext<"/api/panel/markalar/[id]/logo">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const id = kimlikAyristir((await ctx.params).id);
    const once = await prisma.marka.findUnique({ where: { id } });
    if (!once) return hata(404, "Marka bulunamadı");
    const form = await req.formData().catch(() => null);
    if (!form) throw new KuralHatasi(400, "Form okunamadı");
    const k = await fotografKaydet(form.get("dosya"), "marka", FOTO_BOYUTU.logo);
    const m = await prisma.marka.update({ where: { id }, data: { logo: k.dosya, logoGenislik: k.genislik, logoYukseklik: k.yukseklik } });
    await dosyaSil(once.logo);
    await log(g.kullanici.id, "MARKA_LOGO", `#${id} ${m.ad}: ${once.logo ?? "—"} → ${k.dosya}`, istemciIp(req));
    return NextResponse.json(markaGorunumu(m), { status: 201 });
  });
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/panel/markalar/[id]/logo">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const id = kimlikAyristir((await ctx.params).id);
    const once = await prisma.marka.findUnique({ where: { id } });
    if (!once) return hata(404, "Marka bulunamadı");
    if (!once.logo) return hata(404, "Markanın logosu yok");
    const m = await prisma.marka.update({ where: { id }, data: { logo: null, logoGenislik: null, logoYukseklik: null } });
    await dosyaSil(once.logo);
    await log(g.kullanici.id, "MARKA_LOGO", `#${id} ${m.ad}: ${once.logo} → —`, istemciIp(req));
    return NextResponse.json(markaGorunumu(m));
  });
}
