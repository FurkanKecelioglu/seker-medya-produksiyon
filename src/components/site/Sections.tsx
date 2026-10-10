import Link from "next/link";
import {
  Aperture, ArrowUpRight, Camera, Clapperboard, Film, Megaphone, Mic, MonitorPlay,
  Music, Phone, Plane, Radio, Scissors, Smartphone, Sparkles, Tv, Users, Video, MessageCircle,
} from "lucide-react";
import type { Gorsel, ProjeKarti, Vitrin } from "@/lib/vitrin";
import { HIZMET_IKONLARI, type HizmetIkonu } from "@/lib/kategoriler";
import { Visual } from "./Visual";

const ikonlar = {
  Aperture, Camera, Clapperboard, Film, Megaphone, Mic, MonitorPlay,
  Music, Plane, Radio, Scissors, Smartphone, Sparkles, Tv, Users, Video,
};

export function ServiceIcon({ name }: { name: string }) {
  const valid = HIZMET_IKONLARI.some((i) => i === name);
  const Icon = valid ? ikonlar[name as HizmetIkonu] : Clapperboard;
  return <Icon size={28} strokeWidth={1.4} aria-hidden="true" />;
}

export function PageHeading({ title, text, label }: { title: string; text?: string; label?: string }) {
  return (
    <div className="page-heading">
      {label && <p className="eyebrow">{label}</p>}
      <h1>{title}</h1>
      {text && <p className="lead muted">{text}</p>}
    </div>
  );
}

export function Paragraphs({ text }: { text: string }) {
  return <div className="prose">{text.split(/\r?\n\s*\r?\n/).filter((p) => p.trim()).map((p, i) => <p key={i}>{p}</p>)}</div>;
}

export function Process({ steps }: { steps: Vitrin["metinler"]["surecAdimlari"] }) {
  if (!steps.length) return null;
  return (
    <ol className="process">
      {steps.map((s, i) => (
        <li key={i}>
          <span className="step-number">{String(i + 1).padStart(2, "0")}</span>
          <h3>{s.baslik}</h3><p className="muted">{s.aciklama}</p>
        </li>
      ))}
    </ol>
  );
}

export function Services({ services }: { services: Vitrin["hizmetler"] }) {
  return (
    <div className="services-grid">
      {services.map((h, i) => (
        <Link href="/hizmetler" className="service-card" key={h.id}>
          <div className="service-top"><ServiceIcon name={h.ikon} /><span>{String(i + 1).padStart(2, "0")}</span></div>
          <h3>{h.baslik}</h3><p className="muted">{h.ozet}</p><ArrowUpRight className="service-arrow" size={20} aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}

export function ProjectCard({ project, large = false }: { project: ProjeKarti; large?: boolean }) {
  const Heading = large ? "h3" : "h2";
  return (
    <Link href={project.adres} className={`project-card ${large ? "large" : ""}`} data-project-card>
      <div className="project-image">
        <Visual image={project.kapak} alt={project.baslik}
          sizes={large ? "100vw" : "(max-width: 767px) 100vw, (max-width: 1099px) 50vw, 33vw"} />
      </div>
      <div className="project-info">
        <p className="eyebrow">{project.kategoriAdi}{project.yil ? ` · ${project.yil}` : ""}</p>
        <Heading>{project.baslik}</Heading>
        {project.musteri && <p className="project-client">{project.musteri}</p>}
      </div>
      <span className="project-arrow"><ArrowUpRight size={26} aria-hidden="true" /></span>
    </Link>
  );
}

export function Feature({ title, text, image, reverse = false }: {
  title: string; text: string; image: Gorsel | null; reverse?: boolean;
}) {
  return (
    <section className={`feature ${reverse ? "reverse" : ""}`}>
      <div className="feature-image"><Visual image={image} alt={title} sizes="(max-width: 767px) 100vw, 50vw" /></div>
      <div className="feature-copy"><h2>{title}</h2><Paragraphs text={text} />
        <Link href="/teklif-al" className="text-link">Proje Teklifi Al<ArrowUpRight size={20} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

export function ContactAlternatives({ contact }: { contact: Vitrin["iletisim"] }) {
  return (
    <div className="button-row">
      {contact.whatsappLinki && (
        <a href={contact.whatsappLinki} className="button outline" target="_blank" rel="noopener noreferrer">
          <MessageCircle size={18} aria-hidden="true" />WhatsApp
        </a>
      )}
      {contact.telefonLinki && (
        <a href={contact.telefonLinki} className="button outline"><Phone size={18} aria-hidden="true" />{contact.telefonMetni}</a>
      )}
    </div>
  );
}

export function CallToAction({ v }: { v: Vitrin }) {
  return (
    <section className="call-to-action section-pad">
      <p className="eyebrow">Proje Teklifi Al</p>
      <h2>{v.metinler.cagriBaslik}</h2><p className="muted lead">{v.metinler.cagriMetni}</p>
      <div className="cta-actions">
        <Link href="/teklif-al" className="button primary">Proje Teklifi Al<ArrowUpRight size={20} aria-hidden="true" /></Link>
        <ContactAlternatives contact={v.iletisim} />
      </div>
    </section>
  );
}
