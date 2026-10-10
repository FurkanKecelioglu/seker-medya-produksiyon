// Kök düzen yalnız fontları taşır; vitrin kabuğu (site) düzenindedir, paneli sarmaz.
// Başlık/açıklama/paylaşım görseli panel ayarlarından üretilir.
import type { Metadata, Viewport } from "next";
import { Manrope, Oswald } from "next/font/google";
import { vitrinVerisi } from "@/lib/vitrin";
import { aramaAciklamasi, aramaBasligi, siteAdresi } from "@/lib/seo";
import "./globals.css";
import { GirisBaslangici } from "@/components/site/giris/GirisBaslangici";

const oswald = Oswald({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-heading" });
const manrope = Manrope({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-body" });

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

export async function generateMetadata(): Promise<Metadata> {
  const v = await vitrinVerisi();
  const baslik = aramaBasligi(v);
  const aciklama = aramaAciklamasi(v);
  const paylasim = v.medya.paylasimGorseli;
  const gorseller = paylasim
    ? [{ url: paylasim.url, width: paylasim.genislik ?? undefined, height: paylasim.yukseklik ?? undefined, alt: v.firma.ad }]
    : undefined;
  return {
    metadataBase: new URL(siteAdresi() || "http://localhost:3060"),
    title: { default: baslik, template: `%s · ${v.firma.ad}` },
    description: aciklama,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website", locale: "tr_TR", siteName: v.firma.ad, title: baslik, description: aciklama, url: "/",
      images: gorseller,
    },
    twitter: { card: "summary_large_image", title: baslik, description: aciklama, images: paylasim ? [paylasim.url] : undefined },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: giriş animasyonunun satır içi betiği boyamadan önce <html data-giris> yazar
    // (components/site/giris). Yalnız bu öğenin KENDİ öznitelikleri için geçerli, alt ağaç denetlenmeye devam eder.
    <html lang="tr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><GirisBaslangici /></head>
      <body className={`${oswald.variable} ${manrope.variable}`}>{children}</body>
    </html>
  );
}
