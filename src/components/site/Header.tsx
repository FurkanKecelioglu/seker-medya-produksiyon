"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Menu, MessageCircle, X } from "lucide-react";
import type { Vitrin } from "@/lib/vitrin";
import { sayfalar } from "./navigation";
import { Visual } from "./Visual";
import { SocialLinks } from "./SocialLinks";
import { useModal } from "./useModal";
import { useHydrated } from "./useHydrated";

export function Header({ firma, iletisim, sosyal }: Pick<Vitrin, "firma" | "iletisim" | "sosyal">) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 30);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useModal(open, dialog, trigger);

  return (
    <>
      <header className={`site-header ${scrolled || pathname !== "/" ? "solid" : ""}`}>
        <Link className="wordmark" href="/" aria-label={`${firma.ad} — Ana Sayfa`}>
          {firma.logo ? <Visual image={firma.logo} alt={firma.ad} sizes="180px" /> : firma.ad}
        </Link>
        <div className="header-actions">
          <Link href="/teklif-al" className="button primary header-quote">
            Proje Teklifi Al <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <button type="button" ref={trigger} className="icon-button menu-toggle" onClick={() => setOpen(true)}
            aria-label="Menüyü aç" aria-expanded={open} aria-controls="site-menu" disabled={!hydrated}>
            <Menu size={24} aria-hidden="true" />
          </button>
        </div>
      </header>
      <dialog ref={dialog} id="site-menu" className="menu-dialog" onCancel={() => setOpen(false)}
        aria-label="Site menüsü" onClose={() => setOpen(false)}>
        <div className="menu-top">
          <span className="wordmark">{firma.ad}</span>
          <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Menüyü kapat">
            <X aria-hidden="true" />
          </button>
        </div>
        <nav className="menu-nav" aria-label="Ana gezinme">
          {sayfalar.map((s, i) => (
            <Link key={s.href} href={s.href} onClick={() => setOpen(false)}
              aria-current={pathname === s.href ? "page" : undefined}>
              <span className="menu-number">{String(i + 1).padStart(2, "0")}</span>
              {s.ad}<ArrowUpRight aria-hidden="true" />
            </Link>
          ))}
        </nav>
        <div className="menu-bottom">
          <div className="contact-alternatives">
            {iletisim.telefonLinki && <a href={iletisim.telefonLinki}>{iletisim.telefonMetni}</a>}
            {iletisim.whatsappLinki && <a href={iletisim.whatsappLinki} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          </div>
          <SocialLinks sosyal={sosyal} />
        </div>
      </dialog>
      {iletisim.whatsappLinki && !open && pathname !== "/teklif-al" && (
        <a className="floating-whatsapp" href={iletisim.whatsappLinki} target="_blank" rel="noopener noreferrer"
          aria-label="WhatsApp ile iletişime geç">
          <MessageCircle size={24} aria-hidden="true" />
        </a>
      )}
    </>
  );
}
