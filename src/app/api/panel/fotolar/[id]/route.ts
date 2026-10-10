// PATCH  /api/panel/fotolar/<id> { aciklama?, galeride?, projeId? } — projeId: null projeden ayırır
// DELETE /api/panel/fotolar/<id> — kayıt ve dosya silinir
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { govdeAyristir, hata, istemciIp, kimlikAyristir, yakala } from "@/lib/http";
import { fotoGuncelleSemasi } from "@/lib/semalar";
import { fotoGorunumu } from "@/lib/projeler";
import { dosyaSil } from "@/lib/yukleme";
import { degisim, degisimOzeti, log } from "@/lib/log";

export async function PATCH(req: Request, ctx: RouteContext<"/api/panel/fotolar/[id]">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const id = kimlikAyristir((await ctx.params).id);
    const b = await govdeAyristir(req, fotoGuncelleSemasi);
    if (b.hata) return b.hata;
    const once = await prisma.foto.findUnique({ where: { id } });
    if (!once) return hata(404, "Fotoğraf bulunamadı");
    if (b.veri.projeId && !(await prisma.proje.findUnique({ where: { id: b.veri.projeId }, select: { id: true } }))) {
      return hata(404, "Proje bulunamadı");
    }
    const f = await prisma.foto.update({ where: { id }, data: b.veri });
    const ozet = degisimOzeti((Object.keys(b.veri) as (keyof typeof b.veri)[]).map((k) => degisim(k, once[k], f[k])));
    await log(g.kullanici.id, "FOTO_DUZENLE", `#${id} — ${ozet}`, istemciIp(req));
    return NextResponse.json(fotoGorunumu(f));
  });
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/panel/fotolar/[id]">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const id = kimlikAyristir((await ctx.params).id);
    const f = await prisma.foto.findUnique({ where: { id } });
    if (!f) return hata(404, "Fotoğraf bulunamadı");
    await prisma.foto.delete({ where: { id } });
    await dosyaSil(f.dosya);
    await log(g.kullanici.id, "FOTO_SIL", `#${id} ${f.projeId ? `proje #${f.projeId}` : "galeri"} ${f.dosya}`, istemciIp(req));
    return NextResponse.json({ ok: true });
  });
}
