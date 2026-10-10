// PATCH  /api/panel/markalar/<id> { ad?, url?, aktif? }
// DELETE /api/panel/markalar/<id> — kayıt ve logo dosyası silinir
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { govdeAyristir, hata, istemciIp, kimlikAyristir, yakala } from "@/lib/http";
import { markaSemasi } from "@/lib/semalar";
import { markaGorunumu } from "@/lib/markalar";
import { dosyaSil } from "@/lib/yukleme";
import { degisim, degisimOzeti, log } from "@/lib/log";

const guncelleSemasi = markaSemasi.partial();

export async function PATCH(req: Request, ctx: RouteContext<"/api/panel/markalar/[id]">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const id = kimlikAyristir((await ctx.params).id);
    const b = await govdeAyristir(req, guncelleSemasi);
    if (b.hata) return b.hata;
    const once = await prisma.marka.findUnique({ where: { id } });
    if (!once) return hata(404, "Marka bulunamadı");
    const m = await prisma.marka.update({ where: { id }, data: b.veri });
    const ozet = degisimOzeti((Object.keys(b.veri) as (keyof typeof b.veri)[]).map((k) => degisim(k, once[k], m[k])));
    await log(g.kullanici.id, "MARKA_DUZENLE", `#${id} ${m.ad} — ${ozet}`, istemciIp(req));
    return NextResponse.json(markaGorunumu(m));
  });
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/panel/markalar/[id]">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const id = kimlikAyristir((await ctx.params).id);
    const m = await prisma.marka.findUnique({ where: { id } });
    if (!m) return hata(404, "Marka bulunamadı");
    await prisma.marka.delete({ where: { id } });
    await dosyaSil(m.logo);
    await log(g.kullanici.id, "MARKA_SIL", `#${id} ${m.ad}`, istemciIp(req));
    return NextResponse.json({ ok: true });
  });
}
