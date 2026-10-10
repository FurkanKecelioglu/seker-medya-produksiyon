"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

const pencereler: HTMLDialogElement[] = [];
let kilitSayisi = 0;
let onceki: { body: string; root: string; y: number };

export function Modal({ acik, kapat, baslik, children, cekmece = false, mesgul = false }: {
  acik: boolean; kapat: () => void; baslik: string; children: ReactNode; cekmece?: boolean; mesgul?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const callback = useRef(kapat);
  const mesgulRef = useRef(mesgul);
  useEffect(() => { callback.current = kapat; mesgulRef.current = mesgul; });
  const kapatGuvenli = () => {
    if (!mesgulRef.current && !dialog.current?.querySelector('form[aria-busy="true"]')) callback.current();
  };
  useEffect(() => {
    if (!acik || !dialog.current) return;
    const el = dialog.current;
    const acan = document.activeElement as HTMLElement | null;
    if (kilitSayisi++ === 0) {
      onceki = { body: document.body.style.cssText, root: document.documentElement.style.overflow, y: window.scrollY };
      // Sayaç, üst üste açılan pencerelerden biri kapanınca alttaki sayfanın kaymasını önler.
      Object.assign(document.body.style, {
        position: "fixed", top: `-${onceki.y}px`, width: "100%", height: "100%", overflow: "hidden",
      });
      document.documentElement.style.overflow = "hidden";
    }
    pencereler.push(el);
    el.showModal();
    const enUst = () => pencereler.at(-1) === el;
    const iptal = (e: Event) => {
      e.preventDefault();
      if (enUst() && !mesgulRef.current && !el.querySelector('form[aria-busy="true"]')) callback.current();
    };
    const tus = (e: KeyboardEvent) => {
      if (!enUst() || e.key !== "Tab") return;
      const adaylar = Array.from(el.querySelectorAll<HTMLElement>(
        "a[href],button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex='0']",
      )).filter((item) => item.getClientRects().length > 0);
      const ilk = adaylar[0];
      const son = adaylar.at(-1);
      if (!ilk || !son) { e.preventDefault(); el.focus(); return; }
      if (e.shiftKey && (document.activeElement === ilk || !el.contains(document.activeElement))) {
        e.preventDefault(); son.focus();
      } else if (!e.shiftKey && (document.activeElement === son || !el.contains(document.activeElement))) {
        e.preventDefault(); ilk.focus();
      }
    };
    el.addEventListener("cancel", iptal);
    document.addEventListener("keydown", tus, true);
    return () => {
      el.removeEventListener("cancel", iptal);
      document.removeEventListener("keydown", tus, true);
      pencereler.splice(pencereler.indexOf(el), 1);
      el.close();
      if (--kilitSayisi === 0) {
        document.body.style.cssText = onceki.body;
        document.documentElement.style.overflow = onceki.root;
        window.scrollTo({ top: onceki.y, behavior: "instant" });
      }
      if (acan?.isConnected) acan.focus({ preventScroll: true });
    };
  }, [acik]);
  if (!acik) return null;
  return (
    <dialog ref={dialog} className={`p-modal ${cekmece ? "p-drawer" : ""}`} aria-label={baslik} tabIndex={-1}>
      <div className="p-modal-head"><h2>{baslik}</h2>
        <button type="button" className="p-icon" aria-label="Pencereyi kapat" disabled={mesgul} onClick={kapatGuvenli}>
          <X size={22} />
        </button>
      </div>
      {acik && children}
    </dialog>
  );
}
