// PATCH /api/panel/teklifler/<id> { durum?, icNot? } — talep silinmez, durumu değişir.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { govdeAyristir, hata, istemciIp, kimlikAyristir, yakala } from "@/lib/http";
import { teklifGuncelleSemasi } from "@/lib/semalar";
import { ayarlariOku } from "@/lib/ayarlar";
import { teklifGorunumu } from "@/lib/teklifler";
import { degisim, degisimOzeti, log } from "@/lib/log";

export async function PATCH(req: Request, ctx: RouteContext<"/api/panel/teklifler/[id]">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const id = kimlikAyristir((await ctx.params).id);
    const b = await govdeAyristir(req, teklifGuncelleSemasi);
    if (b.hata) return b.hata;
    if (b.veri.durum === undefined && b.veri.icNot === undefined) return hata(400, "Değiştirilecek alan yok");
    const once = await prisma.teklifTalebi.findUnique({ where: { id } });
    if (!once) return hata(404, "Talep bulunamadı");
    const t = await prisma.teklifTalebi.update({ where: { id }, data: b.veri });
    const ozet = degisimOzeti([degisim("durum", once.durum, t.durum), degisim("not", once.icNot, t.icNot)]);
    await log(g.kullanici.id, "TEKLIF_DUZENLE", `#${id} ${t.ad} — ${ozet}`, istemciIp(req));
    return NextResponse.json(teklifGorunumu(t, (await ayarlariOku()).firma_adi));
  });
}
