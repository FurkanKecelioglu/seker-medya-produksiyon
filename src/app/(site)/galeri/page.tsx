import type { Metadata } from "next";
import { galeri, vitrinVerisi } from "@/lib/vitrin";
import { PageHeading } from "@/components/site/Sections";
import { Gallery } from "@/components/site/Gallery";

export async function generateMetadata(): Promise<Metadata> {
  const v = await vitrinVerisi();
  return { title: "Galeri", description: v.firma.altSlogan, alternates: { canonical: "/galeri" } };
}

export default async function GalleryPage() {
  const photos = await galeri();
  return <section className="inner-page section-pad"><PageHeading title="Galeri" /><Gallery photos={photos} /></section>;
}
