// Panelin gördüğü teklif talebi biçimi. WhatsApp bağlantısı hazır mesajla gelir:
// yönetici tek tıkla dönüş yapar, mesaj kendiliğinden GİTMEZ (wa.me yalnız sohbeti
// açar, gönder tuşuna yönetici basar — berberdeki karar 0001 ile aynı yol, maliyetsiz).
import { telefonGoster, telefonUluslararasi } from "@/lib/telefon";
import { tarihSaat, uzunTarih } from "@/lib/tarih";
import { TEKLIF_DURUMLARI } from "@/lib/kategoriler";
import type { TeklifTalebi } from "@/generated/prisma/client";

export function teklifGorunumu(t: TeklifTalebi, firmaAdi: string) {
  const ilkAd = t.ad.split(/\s+/)[0];
  const konu = t.hizmet ? `${t.hizmet} için ` : "";
  const mesaj = `Merhaba ${ilkAd}, ${firmaAdi}'dan yazıyoruz. ${konu}teklif talebinizi aldık, teşekkür ederiz.`;
  return {
    id: t.id,
    ad: t.ad,
    telefon: t.telefon,
    telefonMetni: telefonGoster(t.telefon),
    telefonLinki: `tel:+${telefonUluslararasi(t.telefon)}`,
    whatsappLinki: `https://wa.me/${telefonUluslararasi(t.telefon)}?text=${encodeURIComponent(mesaj)}`,
    eposta: t.eposta,
    firma: t.firma,
    hizmet: t.hizmet,
    etkinlikTarihi: t.etkinlikTarihi,
    // Gün metni İstanbul öğlesinden kurulur: gece yarısından kurulsa UTC'de önceki güne düşerdi
    etkinlikTarihiMetni: t.etkinlikTarihi ? uzunTarih(new Date(`${t.etkinlikTarihi}T12:00:00+03:00`)) : null,
    mesaj: t.mesaj,
    durum: t.durum,
    durumAdi: TEKLIF_DURUMLARI.find((d) => d.kod === t.durum)?.ad ?? t.durum,
    icNot: t.icNot,
    olusturma: t.olusturma.toISOString(),
    olusturmaMetni: tarihSaat(t.olusturma),
  };
}
