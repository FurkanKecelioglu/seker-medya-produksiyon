import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { vitrinVerisi } from "@/lib/vitrin";
import { CallToAction, PageHeading, ServiceIcon } from "@/components/site/Sections";

export async function generateMetadata(): Promise<Metadata> {
  const v = await vitrinVerisi();
  return { title: "Hizmetler", description: v.firma.altSlogan, alternates: { canonical: "/hizmetler" } };
}

export default async function ServicePage() {
  const v = await vitrinVerisi();
  return (
    <>
      <section className="inner-page section-pad">
        <PageHeading title="Hizmetler" text={v.firma.altSlogan} />
        <div className="service-rows">{v.hizmetler.map((h, i) => (
          <article key={h.id} className="service-row">
            <span className="step-number">{String(i + 1).padStart(2, "0")}</span>
            <ServiceIcon name={h.ikon} />
            <div><h2>{h.baslik}</h2><p className="muted">{h.ozet}</p>
              <Link href={`/teklif-al?hizmet=${encodeURIComponent(h.baslik)}`} className="text-link">
                Teklif al<ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}</div>
      </section><CallToAction v={v} />
    </>
  );
}
