// POST /api/teklif — "Proje Teklifi Al" formu (herkese açık).
// Spam katmanları lib/teklif.ts'te anlatılıyor. Talep panele düşer; bildirim
// (e-posta/push) henüz yok — karar 0004.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { govdeAyristir, hata, istemciIp } from "@/lib/http";
import { hizSiniri } from "@/lib/hizSiniri";
import { teklifSemasi } from "@/lib/semalar";
import { jetonDogrula } from "@/lib/teklif";
import { telefonNormallestir } from "@/lib/telefon";
import { log } from "@/lib/log";

const MESAJ: Record<string, string> = {
  bozuk: "Form süresi doldu. Sayfayı yenileyip tekrar gönderin.",
  eski: "Form süresi doldu. Sayfayı yenileyip tekrar gönderin.",
  erken: "Form çok hızlı gönderildi. Birkaç saniye bekleyip tekrar deneyin.",
};

export async function POST(req: Request) {
  const ip = istemciIp(req);
  // Hız sınırı gövdeden ÖNCE: bozuk gövdeli seri istekler de sayılsın
  const bekle = hizSiniri(`teklif-ip:${ip}`, 5, 3600) ?? hizSiniri("teklif-toplam", 60, 3600);
  if (bekle) {
    const dk = Math.ceil(bekle / 60);
    return hata(429, `Çok fazla talep gönderildi. ${dk} dakika sonra tekrar deneyin ya da bizi arayın.`, { tekrarSn: bekle });
  }
  const b = await govdeAyristir(req, teklifSemasi);
  if (b.hata) return b.hata;
  const v = b.veri;

  if (v.web_sitesi) {
    // Bal küpü doldu: kayıt yok, ama bot başarılı sansın (lib/teklif.ts)
    await log(null, "TEKLIF_BOT", `bal küpü dolu — ${v.ad.slice(0, 40)}`, ip);
    return NextResponse.json({ ok: true }, { status: 201 });
  }
  const jeton = jetonDogrula(v.jeton);
  if (jeton !== "gecerli") {
    await log(null, "TEKLIF_RED", `jeton ${jeton} — ${v.ad.slice(0, 40)}`, ip);
    return hata(400, MESAJ[jeton], { alan: "jeton" });
  }
  const telefon = telefonNormallestir(v.telefon);
  if (!telefon) return hata(400, "Telefon numarası geçersiz. 05XX XXX XX XX biçiminde yazın.", { alan: "telefon" });

  const t = await prisma.teklifTalebi.create({
    data: {
      ad: v.ad, telefon, eposta: v.eposta, firma: v.firma, hizmet: v.hizmet,
      etkinlikTarihi: v.etkinlikTarihi, mesaj: v.mesaj, ip,
    },
  });
  await log(null, "TEKLIF_GELDI", `#${t.id} ${t.ad} ${t.telefon}${t.hizmet ? ` — ${t.hizmet}` : ""}`, ip);
  return NextResponse.json({ ok: true }, { status: 201 });
}
