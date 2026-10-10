import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Vitrin } from "@/lib/vitrin";
import { bugun } from "@/lib/tarih";
import { sayfalar } from "./navigation";
import { SocialLinks } from "./SocialLinks";

export function ContactDetails({ iletisim }: { iletisim: Vitrin["iletisim"] }) {
  return (
    <div className="contact-details">
      {iletisim.telefonLinki && <a className="contact-phone" href={iletisim.telefonLinki}>{iletisim.telefonMetni}</a>}
      {iletisim.eposta && <a href={`mailto:${iletisim.eposta}`}>{iletisim.eposta}</a>}
      {iletisim.adres && <p>{iletisim.adres}</p>}
      {iletisim.haritaLink && (
        <a href={iletisim.haritaLink} target="_blank" rel="noopener noreferrer">
          Yol tarifi al <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

export function Footer({ v }: { v: Vitrin }) {
  return (
    <footer className="site-footer section-pad">
      <div className="footer-grid">
        <div><Link href="/" className="wordmark">{v.firma.ad}</Link><p className="muted">{v.firma.altSlogan}</p></div>
        <ContactDetails iletisim={v.iletisim} />
        <nav aria-label="Alt bölüm gezinme">
          {sayfalar.map((s) => <Link key={s.href} href={s.href}>{s.ad}</Link>)}
          <Link href="/teklif-al">Proje Teklifi Al</Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {bugun().slice(0, 4)} {v.firma.ad}</span>
        <SocialLinks sosyal={v.sosyal} />
        <Link href="/panel" className="management-link" prefetch={false}>Yönetim</Link>
      </div>
    </footer>
  );
}
