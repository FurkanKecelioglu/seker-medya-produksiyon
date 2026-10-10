// GET   /api/panel/ayarlar — metin ayarları + medya ayarları (adres ve boyutlarıyla) + alan tanımları
// PATCH /api/panel/ayarlar { anahtar: değer, … } — yalnız gönderilen metin ayarları değişir
//
// Alan tanımları (etiket, en uzun) cevapta gelir: panel formu bu listeden çizilir,
// yeni ayar eklendiğinde ekranda ayrıca alan yazmak gerekmez.
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/guard";
import { govdeAyristir, hata, istemciIp } from "@/lib/http";
import {
  ayarlariOku, MEDYA_AYARLARI, MEDYA_ANAHTARLARI, METIN_ANAHTARLARI, METIN_AYARLARI, type MetinAnahtari,
} from "@/lib/ayarlar";
import { telefonNormallestir } from "@/lib/telefon";
import { videoAdresiCoz } from "@/lib/video";
import { yuklemeAdresi } from "@/lib/yukleme";
import { degisim, degisimOzeti, log } from "@/lib/log";

export async function GET() {
  const g = await guard();
  if (g.hata) return g.hata;
  const a = await ayarlariOku();
  return NextResponse.json({
    metin: Object.fromEntries(METIN_ANAHTARLARI.map((k) => [k, a[k]])),
    medya: Object.fromEntries(MEDYA_ANAHTARLARI.map((k) => {
      const m = a.medya[k];
      return [k, m ? { url: yuklemeAdresi(m.dosya), genislik: m.genislik, yukseklik: m.yukseklik } : null];
    })),
    alanlar: {
      metin: METIN_ANAHTARLARI.map((k) => ({ anahtar: k, etiket: METIN_AYARLARI[k].etiket, enUzun: METIN_AYARLARI[k].enUzun })),
      medya: MEDYA_ANAHTARLARI.map((k) => ({ anahtar: k, etiket: MEDYA_AYARLARI[k].etiket, tur: MEDYA_AYARLARI[k].tur })),
    },
  });
}

// Her anahtar kendi üst sınırıyla; bilinmeyen anahtar reddedilir (strict)
const sema = z.object(
  Object.fromEntries(METIN_ANAHTARLARI.map((k) => {
    const t = METIN_AYARLARI[k];
    return [k, z.string().trim().max(t.enUzun, `${t.etiket} en fazla ${t.enUzun} karakter`).optional()];
  })) as Record<MetinAnahtari, z.ZodOptional<z.ZodString>>,
).strict();

const ZORUNLU: MetinAnahtari[] = ["firma_adi", "slogan"];

/** Anahtara özel biçim denetimi ve normalleştirme. Hata metni döndürürse kayıt yapılmaz. */
function normallestir(k: MetinAnahtari, v: string): { deger: string } | { hata: string } {
  if (!v) return ZORUNLU.includes(k) ? { hata: `${METIN_AYARLARI[k].etiket} boş bırakılamaz` } : { deger: "" };
  if (k === "telefon" || k === "whatsapp") {
    // Kayıtta normalleştirilir: ekrandaki boşluklu numara, tel: ve wa.me bağlantısı tek biçimden üretilir
    const t = telefonNormallestir(v);
    return t ? { deger: t } : { hata: `${METIN_AYARLARI[k].etiket} geçersiz. 05XX XXX XX XX biçiminde yazın.` };
  }
  if (k === "showreel" && !videoAdresiCoz(v)) {
    return { hata: "Showreel bağlantısı tanınmadı. YouTube ya da Vimeo video adresini yapıştırın." };
  }
  if (k === "eposta" && !z.email().safeParse(v).success) return { hata: "E-posta adresi geçersiz" };
  if (k === "harita_link" && !/^https:\/\/\S+$/i.test(v)) return { hata: "Harita bağlantısı https:// ile başlamalı" };
  return { deger: v };
}

export async function PATCH(req: Request) {
  const g = await guard();
  if (g.hata) return g.hata;
  const b = await govdeAyristir(req, sema);
  if (b.hata) return b.hata;
  const gelen = Object.entries(b.veri).filter(([, v]) => v !== undefined) as [MetinAnahtari, string][];
  if (gelen.length === 0) return hata(400, "Değiştirilecek ayar yok");

  const yazilacak: [MetinAnahtari, string][] = [];
  for (const [k, v] of gelen) {
    const s = normallestir(k, v);
    if ("hata" in s) return hata(400, s.hata, { alan: k });
    yazilacak.push([k, s.deger]);
  }

  const once = await ayarlariOku();
  await prisma.$transaction(
    yazilacak.map(([anahtar, deger]) => prisma.ayar.upsert({ where: { anahtar }, create: { anahtar, deger }, update: { deger } })),
  );
  const ozet = degisimOzeti(yazilacak.map(([k, v]) => degisim(k, once[k], v)));
  await log(g.kullanici.id, "AYAR_DEGISTI", ozet, istemciIp(req));
  return NextResponse.json({ ok: true });
}
