import type { Metadata } from "next";
import { vitrinVerisi } from "@/lib/vitrin";
import { CallToAction, PageHeading, Paragraphs, Process, Services } from "@/components/site/Sections";
import { Visual } from "@/components/site/Visual";

export async function generateMetadata(): Promise<Metadata> {
  const v = await vitrinVerisi();
  return { title: "Hakkımızda", description: v.metinler.kisaTanitim, alternates: { canonical: "/hakkimizda" } };
}

export default async function About() {
  const v = await vitrinVerisi();
  return (
    <>
      <section className="inner-page section-pad">
        <PageHeading title="Hakkımızda" text={v.metinler.kisaTanitimBaslik} />
        <div className="about-grid">
          <div className="about-image">
            <Visual image={v.medya.hakkimizdaGorseli} alt={v.firma.ad} sizes="(max-width: 767px) 100vw, 50vw" />
          </div>
          <Paragraphs text={v.metinler.hakkimizda.trim() || v.metinler.kisaTanitim} />
        </div>
        {v.metinler.surecAdimlari.length > 0 && <>
          <div className="section-heading"><h2>Çalışma süreci</h2></div>
          <Process steps={v.metinler.surecAdimlari} />
        </>}
        <div className="section-heading"><h2>Hizmetler</h2></div><Services services={v.hizmetler} />
      </section>
      <CallToAction v={v} />
    </>
  );
}
