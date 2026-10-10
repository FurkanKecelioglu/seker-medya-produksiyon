// PATCH  /api/panel/hizmetler/<id> — kısmi güncelleme
// DELETE /api/panel/hizmetler/<id> — siler. Hizmete bağlı kayıt yok (teklif talebi
// hizmetin adını kopyalayarak saklar), bu yüzden pasifleştirme yerine silme güvenli.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { govdeAyristir, hata, istemciIp, kimlikAyristir, yakala } from "@/lib/http";
import { hizmetSemasi } from "@/lib/semalar";
import { degisim, degisimOzeti, log } from "@/lib/log";

const guncelleSemasi = hizmetSemasi.partial();

export async function PATCH(req: Request, ctx: RouteContext<"/api/panel/hizmetler/[id]">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const id = kimlikAyristir((await ctx.params).id);
    const b = await govdeAyristir(req, guncelleSemasi);
    if (b.hata) return b.hata;
    const once = await prisma.hizmet.findUnique({ where: { id } });
    if (!once) return hata(404, "Hizmet bulunamadı");
    const h = await prisma.hizmet.update({ where: { id }, data: b.veri });
    const ozet = degisimOzeti((Object.keys(b.veri) as (keyof typeof b.veri)[]).map((k) => degisim(k, once[k], h[k])));
    await log(g.kullanici.id, "HIZMET_DUZENLE", `#${id} ${h.baslik} — ${ozet}`, istemciIp(req));
    return NextResponse.json(h);
  });
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/panel/hizmetler/[id]">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const id = kimlikAyristir((await ctx.params).id);
    const h = await prisma.hizmet.findUnique({ where: { id } });
    if (!h) return hata(404, "Hizmet bulunamadı");
    await prisma.hizmet.delete({ where: { id } });
    await log(g.kullanici.id, "HIZMET_SIL", `#${id} ${h.baslik}`, istemciIp(req));
    return NextResponse.json({ ok: true });
  });
}
