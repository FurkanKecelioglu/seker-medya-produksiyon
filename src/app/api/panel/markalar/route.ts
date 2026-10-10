// GET  /api/panel/markalar — bütün markalar (pasifler dahil)
// POST /api/panel/markalar (multipart: ad, url?, logo?) — logo isteğe bağlı: logosu
//      henüz gelmemiş kurum adıyla eklenir, tasarım adı yazı olarak gösterir.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { hata, istemciIp, KuralHatasi, yakala } from "@/lib/http";
import { markaSemasi } from "@/lib/semalar";
import { FOTO_BOYUTU, fotografKaydet } from "@/lib/yukleme";
import { markaGorunumu } from "@/lib/markalar";
import { log } from "@/lib/log";

export async function GET() {
  const g = await guard();
  if (g.hata) return g.hata;
  const markalar = await prisma.marka.findMany({ orderBy: [{ sira: "asc" }, { id: "asc" }] });
  return NextResponse.json({ markalar: markalar.map(markaGorunumu) });
}

export async function POST(req: Request) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const form = await req.formData().catch(() => null);
    if (!form) throw new KuralHatasi(400, "Form okunamadı");
    const s = markaSemasi.safeParse({ ad: String(form.get("ad") ?? ""), url: String(form.get("url") ?? "") });
    if (!s.success) {
      const ilk = s.error.issues[0];
      return hata(400, ilk?.message || "Geçersiz veri", { alan: ilk?.path.join(".") });
    }
    const dosya = form.get("logo");
    const logo = dosya instanceof File && dosya.size > 0 ? await fotografKaydet(dosya, "marka", FOTO_BOYUTU.logo) : null;
    const son = await prisma.marka.aggregate({ _max: { sira: true } });
    const m = await prisma.marka.create({
      data: {
        ad: s.data.ad, url: s.data.url, sira: (son._max.sira ?? 0) + 1,
        logo: logo?.dosya ?? null, logoGenislik: logo?.genislik ?? null, logoYukseklik: logo?.yukseklik ?? null,
      },
    });
    await log(g.kullanici.id, "MARKA_EKLE", `#${m.id} ${m.ad}${logo ? ` ${logo.dosya}` : " (logosuz)"}`, istemciIp(req));
    return NextResponse.json(markaGorunumu(m), { status: 201 });
  });
}
