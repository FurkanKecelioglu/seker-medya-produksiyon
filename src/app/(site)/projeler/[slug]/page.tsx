import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { projeDetayi } from "@/lib/vitrin";
import { PageHeading, Paragraphs } from "@/components/site/Sections";
import { VideoCard } from "@/components/site/VideoCard";
import { Visual } from "@/components/site/Visual";
import { Gallery } from "@/components/site/Gallery";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await projeDetayi((await params).slug);
  // Metadata hatası sayfanın 404 gövdesini erken kesmesin; 404 kararı sayfa bileşenindedir.
  if (!p) return { title: "Proje bulunamadı", robots: { index: false, follow: false } };
  const images = p.kapak ? [{ url: p.kapak.url, alt: p.baslik }] : undefined;
  return {
    title: p.baslik, description: p.ozet, alternates: { canonical: p.adres },
    openGraph: { title: p.baslik, description: p.ozet, url: p.adres, images },
    twitter: { card: "summary_large_image", title: p.baslik, description: p.ozet, images },
  };
}

export default async function ProjectDetail({ params }: Props) {
  const p = await projeDetayi((await params).slug);
  if (!p) notFound();
  return (
    <article className="inner-page section-pad project-detail">
      <Link className="text-link back-link" href="/projeler"><ArrowLeft size={18} aria-hidden="true" />Projeler</Link>
      <PageHeading title={p.baslik} label={p.kategoriAdi} />
      {p.video ? <VideoCard video={p.video} cover={p.kapak} title={p.baslik} />
        : <div className="detail-cover"><Visual image={p.kapak} alt={p.baslik} sizes="100vw" /></div>}
      <div className="project-description">
        <dl className="project-credits">
          <div><dt>Kategori</dt><dd>{p.kategoriAdi}</dd></div>
          {p.musteri && <div><dt>Müşteri</dt><dd>{p.musteri}</dd></div>}
          {p.yil && <div><dt>Yıl</dt><dd>{p.yil}</dd></div>}
        </dl>
        <div><h2 className="sr-only">Proje hakkında</h2><Paragraphs text={p.aciklama || p.ozet} /></div>
      </div>
      {p.fotolar.length > 0 && <section>
        <h2 className="gallery-title">Proje fotoğrafları</h2><Gallery photos={p.fotolar} title={p.baslik} />
      </section>}
      <nav className="project-neighbors" aria-label="Diğer projeler">
        {p.onceki && <Link href={p.onceki.adres}>
          <ArrowLeft size={20} aria-hidden="true" /><span>Önceki proje<strong>{p.onceki.baslik}</strong></span>
        </Link>}
        {p.sonraki && <Link href={p.sonraki.adres}>
          <span>Sonraki proje<strong>{p.sonraki.baslik}</strong></span><ArrowRight size={20} aria-hidden="true" />
        </Link>}
      </nav>
      <div className="detail-cta"><h2>Benzer bir iş için teklif alın</h2>
        <Link href="/teklif-al" className="button primary">Proje Teklifi Al<ArrowUpRight size={20} aria-hidden="true" /></Link>
      </div>
    </article>
  );
}
