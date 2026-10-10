// GET    /api/panel/projeler/<id> — proje + fotoğrafları
// PATCH  /api/panel/projeler/<id> — kısmi güncelleme (videoAdresi: "" videoyu kaldırır)
// DELETE /api/panel/projeler/<id> — proje, fotoğraf kayıtları ve DOSYALARI silinir.
//   Projeyi siteden kaldırıp saklamak isteyen "yayinda: false" yapar; silme geri alınamaz.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { govdeAyristir, hata, istemciIp, kimlikAyristir, yakala } from "@/lib/http";
import { projeSemasi } from "@/lib/semalar";
import { projeGorunumu, slugBelirle, videoAlanlari } from "@/lib/projeler";
import { dosyaSil } from "@/lib/yukleme";
import { degisim, degisimOzeti, log } from "@/lib/log";

const guncelleSemasi = projeSemasi.partial();
const FOTO_SIRASI = { orderBy: [{ sira: "asc" as const }, { id: "asc" as const }] };

export async function GET(_req: Request, ctx: RouteContext<"/api/panel/projeler/[id]">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const id = kimlikAyristir((await ctx.params).id);
    const p = await prisma.proje.findUnique({ where: { id }, include: { fotolar: FOTO_SIRASI } });
    if (!p) return hata(404, "Proje bulunamadı");
    return NextResponse.json(projeGorunumu(p));
  });
}

export async function PATCH(req: Request, ctx: RouteContext<"/api/panel/projeler/[id]">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const id = kimlikAyristir((await ctx.params).id);
    const b = await govdeAyristir(req, guncelleSemasi);
    if (b.hata) return b.hata;
    const once = await prisma.proje.findUnique({ where: { id } });
    if (!once) return hata(404, "Proje bulunamadı");
    const { slug, videoAdresi, ...alanlar } = b.veri;
    const veri = {
      ...alanlar,
      ...videoAlanlari(videoAdresi),
      // Adres yalnız açıkça gönderildiyse değişir; başlık değişince adres KENDİLİĞİNDEN
      // değişmez — paylaşılmış bağlantılar kırılmasın
      ...(slug !== undefined ? { slug: await slugBelirle(slug, alanlar.baslik ?? once.baslik, id) } : {}),
    };
    const p = await prisma.proje.update({ where: { id }, data: veri, include: { fotolar: FOTO_SIRASI } });
    const alanAdlari = [
      "baslik", "slug", "kategori", "musteri", "yil", "ozet", "aciklama",
      "videoSaglayici", "videoKimlik", "oneCikan", "yayinda",
    ] as const;
    const ozet = degisimOzeti(alanAdlari.filter((k) => k in veri).map((k) => degisim(k, once[k], p[k])));
    await log(g.kullanici.id, "PROJE_DUZENLE", `#${id} ${p.baslik} — ${ozet}`, istemciIp(req));
    return NextResponse.json(projeGorunumu(p));
  });
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/panel/projeler/[id]">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const id = kimlikAyristir((await ctx.params).id);
    const p = await prisma.proje.findUnique({ where: { id }, include: { fotolar: true } });
    if (!p) return hata(404, "Proje bulunamadı");
    // Önce kayıt (fotoğraflar Cascade ile), sonra dosyalar: dosya silme yarıda kalırsa
    // en kötü ihtimalle diskte yetim dosya kalır, sitede kırık görsel kalmaz.
    await prisma.proje.delete({ where: { id } });
    for (const d of [p.kapak, ...p.fotolar.map((f) => f.dosya)]) await dosyaSil(d);
    await log(g.kullanici.id, "PROJE_SIL", `#${id} ${p.baslik} (${p.fotolar.length} fotoğrafla)`, istemciIp(req));
    return NextResponse.json({ ok: true });
  });
}
