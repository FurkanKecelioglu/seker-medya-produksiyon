// POST   /api/panel/ayarlar/medya/<anahtar>  (multipart: dosya) — görsel ya da açılış videosu yükler
// DELETE /api/panel/ayarlar/medya/<anahtar>  — kaldırır (tasarımın varsayılanına döner)
// Eski dosya, yenisi kaydedildikten SONRA silinir: yükleme yarıda kalırsa site görselsiz kalmasın.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { hata, istemciIp, KuralHatasi, yakala } from "@/lib/http";
import { ayarlariOku, MEDYA_AYARLARI, medyaDegeriYaz, type MedyaAnahtari } from "@/lib/ayarlar";
import { dosyaSil, FOTO_BOYUTU, fotografKaydet, videoKaydet, yuklemeAdresi } from "@/lib/yukleme";
import { log } from "@/lib/log";

function anahtarAl(ham: string): MedyaAnahtari {
  if (!(ham in MEDYA_AYARLARI)) throw new KuralHatasi(404, "Böyle bir medya ayarı yok");
  return ham as MedyaAnahtari;
}

function enUzunKenar(anahtar: MedyaAnahtari): number {
  if (anahtar === "logo") return FOTO_BOYUTU.logo;
  if (anahtar === "paylasim_gorseli") return FOTO_BOYUTU.paylasim;
  return FOTO_BOYUTU.kapak;
}

export async function POST(req: Request, ctx: RouteContext<"/api/panel/ayarlar/medya/[anahtar]">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const anahtar = anahtarAl((await ctx.params).anahtar);
    const form = await req.formData().catch(() => null);
    if (!form) throw new KuralHatasi(400, "Form okunamadı");
    const dosya = form.get("dosya");
    const yeni = MEDYA_AYARLARI[anahtar].tur === "video"
      ? { ...(await videoKaydet(dosya, anahtar.replace(/_/g, "-"))), genislik: null, yukseklik: null }
      : await fotografKaydet(dosya, anahtar.replace(/_/g, "-"), enUzunKenar(anahtar));
    const eski = (await ayarlariOku()).medya[anahtar];
    const deger = medyaDegeriYaz({ dosya: yeni.dosya, genislik: yeni.genislik, yukseklik: yeni.yukseklik });
    await prisma.ayar.upsert({ where: { anahtar }, create: { anahtar, deger }, update: { deger } });
    await dosyaSil(eski?.dosya);
    await log(g.kullanici.id, "MEDYA_YUKLE", `${anahtar}: ${eski?.dosya ?? "—"} → ${yeni.dosya}`, istemciIp(req));
    return NextResponse.json(
      { url: yuklemeAdresi(yeni.dosya), genislik: yeni.genislik, yukseklik: yeni.yukseklik },
      { status: 201 },
    );
  });
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/panel/ayarlar/medya/[anahtar]">) {
  const g = await guard();
  if (g.hata) return g.hata;
  return yakala(async () => {
    const anahtar = anahtarAl((await ctx.params).anahtar);
    const eski = (await ayarlariOku()).medya[anahtar];
    if (!eski) return hata(404, "Kaldırılacak dosya yok");
    await prisma.ayar.delete({ where: { anahtar } });
    await dosyaSil(eski.dosya);
    await log(g.kullanici.id, "MEDYA_SIL", `${anahtar}: ${eski.dosya}`, istemciIp(req));
    return NextResponse.json({ ok: true });
  });
}
