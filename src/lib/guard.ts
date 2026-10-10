// Tek yetki kapısı. Her panel API ucunun ilk iki satırı:
//
//   const g = await guard();
//   if (g.hata) return g.hata;          // 401 hazır cevap
//
// Yetki çerezden değil VERİTABANINDAN okunur: pasifleştirilen ya da şifresi
// değişen hesabın erişimi aynı dakika kesilmeli (rehber §3.1).
// Sayfa tarafı için: sayfaOturumu() — oturum yoksa /panel/giris'e yönlendirir.
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { oturumOku } from "@/lib/oturum";
import { hata } from "@/lib/http";

export type PanelKullanici = { id: number; ad: string; kullaniciAdi: string };

export async function aktifKullanici(): Promise<PanelKullanici | null> {
  const o = await oturumOku();
  if (!o) return null;
  const y = await prisma.yonetici.findUnique({
    where: { id: o.yoneticiId },
    select: { id: true, ad: true, kullaniciAdi: true, aktif: true, oturumNo: true },
  });
  if (!y || !y.aktif || y.oturumNo !== o.oturumNo) return null;
  return { id: y.id, ad: y.ad, kullaniciAdi: y.kullaniciAdi };
}

export async function guard() {
  const k = await aktifKullanici();
  if (!k) return { hata: hata(401, "Oturum açmanız gerekiyor") } as const;
  return { kullanici: k } as const;
}

/** Panel sayfalarının en üstünde çağrılır. */
export async function sayfaOturumu(): Promise<PanelKullanici> {
  const k = await aktifKullanici();
  if (!k) redirect("/panel/giris");
  return k;
}
