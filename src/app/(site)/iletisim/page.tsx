import type { Metadata } from "next";
import { vitrinVerisi } from "@/lib/vitrin";
import { ContactAlternatives, PageHeading } from "@/components/site/Sections";
import { ContactDetails } from "@/components/site/Footer";
import { SocialLinks } from "@/components/site/SocialLinks";
import { QuoteForm } from "@/components/site/QuoteForm";

export async function generateMetadata(): Promise<Metadata> {
  const v = await vitrinVerisi();
  return { title: "İletişim", description: v.metinler.cagriMetni || v.firma.altSlogan, alternates: { canonical: "/iletisim" } };
}

export default async function ContactPage() {
  const v = await vitrinVerisi();
  return (
    <section className="inner-page section-pad">
      <PageHeading title="İletişim" />
      <div className="contact-grid">
        <div className="contact-copy"><h2>{v.metinler.cagriBaslik}</h2><p className="muted">{v.metinler.cagriMetni}</p>
          <ContactDetails iletisim={v.iletisim} /><ContactAlternatives contact={v.iletisim} /><SocialLinks sosyal={v.sosyal} />
        </div>
        <div><h2 className="form-title">Proje Teklifi Al</h2><QuoteForm services={v.hizmetler} whatsapp={v.iletisim.whatsappLinki} /></div>
      </div>
    </section>
  );
}
