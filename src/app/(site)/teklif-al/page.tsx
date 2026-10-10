import type { Metadata } from "next";
import { vitrinVerisi } from "@/lib/vitrin";
import { ContactAlternatives, PageHeading } from "@/components/site/Sections";
import { QuoteForm } from "@/components/site/QuoteForm";

export async function generateMetadata(): Promise<Metadata> {
  const v = await vitrinVerisi();
  return { title: "Proje Teklifi Al", description: v.metinler.cagriMetni || v.firma.altSlogan, alternates: { canonical: "/teklif-al" } };
}

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ hizmet?: string | string[] }> }) {
  const [v, query] = await Promise.all([vitrinVerisi(), searchParams]);
  return (
    <section className="inner-page section-pad quote-page">
      <PageHeading title="Proje Teklifi Al" text={v.metinler.cagriMetni} />
      <QuoteForm services={v.hizmetler} selected={typeof query.hizmet === "string" ? query.hizmet : ""}
        whatsapp={v.iletisim.whatsappLinki} />
      <div className="quote-alternatives">
        {v.metinler.guvenSatiri && <p className="muted">{v.metinler.guvenSatiri}</p>}
        <ContactAlternatives contact={v.iletisim} />
      </div>
    </section>
  );
}
