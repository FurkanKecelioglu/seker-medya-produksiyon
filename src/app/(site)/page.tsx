import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { vitrinVerisi } from "@/lib/vitrin";
import { aramaAciklamasi, aramaBasligi, firmaVerisi, jsonLd } from "@/lib/seo";
import { Hero } from "@/components/site/Hero";
import { GirisAnimasyonu } from "@/components/site/giris/GirisAnimasyonu";
import { CallToAction, Feature, Process, ProjectCard, Services } from "@/components/site/Sections";
import { VideoCard } from "@/components/site/VideoCard";
import { Visual } from "@/components/site/Visual";
import { Reveal } from "@/components/site/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const v = await vitrinVerisi();
  return { title: { absolute: aramaBasligi(v) }, description: aramaAciklamasi(v), alternates: { canonical: "/" } };
}

export default async function Home() {
  const v = await vitrinVerisi();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(firmaVerisi(v)) }} />
      {/* Giriş animasyonu açılışın HEMEN önünde, kardeş olarak: perde kalkarken açılış metni süzülür (giris.module.css) */}
      <GirisAnimasyonu v={v} />
      <Hero v={v} />
      {v.metinler.guvenSatiri && <div className="trust-strip"><p>{v.metinler.guvenSatiri}</p></div>}
      <section id="tanitim" className="intro section-pad reveal">
        <div className="intro-grid">
          <p className="eyebrow">Hakkımızda</p>
          <div><h2>{v.metinler.kisaTanitimBaslik}</h2><p className="lead muted">{v.metinler.kisaTanitim}</p>
            <Link href="/hakkimizda" className="text-link">Bizi tanıyın<ArrowUpRight size={19} aria-hidden="true" /></Link>
          </div>
        </div>
        <Process steps={v.metinler.surecAdimlari} />
      </section>
      <section className="section-pad services-section reveal">
        <div className="section-heading"><h2>Hizmetler</h2>
          <span className="eyebrow">{String(v.hizmetler.length).padStart(2, "0")}</span>
        </div>
        <Services services={v.hizmetler} />
      </section>
      {v.medya.showreel && <section id="showreel" className="section-pad showreel-section reveal">
        <div className="section-heading"><h2>Showreel</h2><span className="eyebrow">Oynat</span></div>
        <VideoCard video={v.medya.showreel} title="Showreel" />
      </section>}
      {v.oneCikanProjeler.length > 0 && <section className="featured-section">
        <div className="section-heading section-pad"><h2>Öne çıkan projeler</h2>
          <Link href="/projeler" className="text-link">Tüm projeler<ArrowUpRight size={20} aria-hidden="true" /></Link>
        </div>
        {v.oneCikanProjeler.map((p) => <ProjectCard key={p.id} project={p} large />)}
        <div className="featured-end">
          <Link href="/projeler" className="button outline">Tüm projeler<ArrowUpRight aria-hidden="true" /></Link>
        </div>
      </section>}
      <Feature title={v.metinler.canliYayinBaslik} text={v.metinler.canliYayinMetni} image={v.medya.canliYayinGorseli} />
      <Feature title={v.metinler.droneBaslik} text={v.metinler.droneMetni} image={v.medya.droneGorseli} reverse />
      {v.markalar.length > 0 && <section className="brands-section section-pad reveal">
        <h2 className="eyebrow">Markalar / kurumlar</h2>
        <div className="brands-grid">{v.markalar.map((m) => {
          const logo = m.logo ? <Visual image={m.logo} alt={m.ad} sizes="(max-width: 767px) 40vw, 180px" natural /> : <span>{m.ad}</span>;
          return m.url
            ? <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="brand">{logo}</a>
            : <div key={m.id} className="brand">{logo}</div>;
        })}</div>
      </section>}
      <CallToAction v={v} />
      <Reveal />
    </>
  );
}
