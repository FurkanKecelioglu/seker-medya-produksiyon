import type { Metadata } from "next";
import { ayarlariOku } from "@/lib/ayarlar";
import { Shell } from "@/components/panel/Shell";

export const metadata: Metadata = {
  title: "Yönetim paneli", robots: { index: false, follow: false }, alternates: { canonical: null },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const ayarlar = await ayarlariOku();
  const logo = ayarlar.medya.logo?.dosya;
  return <Shell firma={ayarlar.firma_adi} logo={logo ? `/yuklemeler/${logo}` : null}>{children}</Shell>;
}
