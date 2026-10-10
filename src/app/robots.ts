// /robots.txt — vitrin açık; panel ve API kapalı.
import type { MetadataRoute } from "next";
import { siteAdresi } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/panel", "/api/"] },
    sitemap: `${siteAdresi()}/sitemap.xml`,
  };
}
