import { ArrowDown, ArrowUpRight, Play } from "lucide-react";
import Link from "next/link";
import type { Vitrin } from "@/lib/vitrin";
import { Visual } from "./Visual";
import { HeroVideo } from "./HeroVideo";

export function Hero({ v }: { v: Vitrin }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-media">
        <Visual image={v.medya.acilisPosteri} alt="" priority sizes="100vw" />
        {v.medya.acilisVideosu && <HeroVideo video={v.medya.acilisVideosu} poster={v.medya.acilisPosteri?.url} />}
      </div>
      <div className="hero-shade" />
      <div className="hero-header-shade" aria-hidden="true" />
      <div className="hero-content">
        {v.metinler.konumSatiri && <p className="eyebrow hero-location"><span className="record-dot" />{v.metinler.konumSatiri}</p>}
        <h1 id="hero-title">{v.firma.slogan}</h1>
        <div className="hero-bottom">
          <p>{v.firma.altSlogan}</p>
          <div className="button-row">
            <Link href="/teklif-al" className="button primary">Proje Teklifi Al<ArrowUpRight size={18} aria-hidden="true" /></Link>
            {v.medya.showreel && (
              <a href="#showreel" className="button outline"><Play size={16} aria-hidden="true" />Showreel&apos;i izle</a>
            )}
          </div>
        </div>
      </div>
      <a href="#tanitim" className="scroll-cue" aria-label="Aşağı kaydır"><ArrowDown size={18} aria-hidden="true" /></a>
    </section>
  );
}
