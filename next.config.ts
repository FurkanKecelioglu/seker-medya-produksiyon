import type { NextConfig } from "next";

// Güvenlik başlıkları (rehber §5.5, §11.1). CSP henüz yok: Next satır içi script
// kullanıyor (nonce altyapısı gerekir) ve YouTube/Vimeo gömmesi için frame-src
// açılacak — önce Report-Only kipinde denenecek.
// X-Frame-Options DENY bizim sayfamızın BAŞKA sitede gömülmesini engeller;
// bizim YouTube'u gömmemizi etkilemez.
const basliklar = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Metadata akıtmasını kapat: Next 16 varsayılanında bazı <head> etiketleri sonradan
  // <body>'ye eklenir; paylaşım önizlemesi (WhatsApp) ve kurulabilirlik <head>'den okur
  // (berberde canlıda görüldü, 2026-10-03).
  htmlLimitedBots: /.*/,
  images: {
    // Rapor: WebP/AVIF. Ana kopya WebP saklanır (lib/yukleme.ts); ziyaretçinin
    // tarayıcısı destekliyorsa AVIF, ekran genişliğine göre küçük kopyaları Next üretir.
    formats: ["image/avif", "image/webp"],
    // Next 16 varsayılanı yalnız [75]; açılış görseli/kapak için 85 de izinli
    qualities: [60, 75, 85],
    localPatterns: [{ pathname: "/yuklemeler/**", search: "" }, { pathname: "/**", search: "" }],
    // Kapağı yüklenmemiş projelerde YouTube küçük resmi (lib/video.ts)
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
    // Yüklenen dosya adı rastgele ve hiç değişmez: iyileştirilmiş kopya uzun süre saklanabilir
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [{ source: "/:path*", headers: basliklar }];
  },
};

export default nextConfig;
