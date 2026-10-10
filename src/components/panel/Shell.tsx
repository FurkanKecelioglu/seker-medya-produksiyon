"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ExternalLink, LogOut, MoreHorizontal } from "lucide-react";
import { Toaster } from "sonner";
import { api } from "./api";
import { GIRIS, MENU, SITE } from "./menu";
import { useHydrated, useIslem } from "./hooks";
import { Modal } from "./Modal";
import { Hata, Resim } from "./ui";

type Ben = { ad: string; kullaniciAdi: string; yeniTeklif: number };

export function Shell({ firma, logo, children }: { firma: string; logo: string | null; children: ReactNode }) {
  const yol = usePathname();
  const giris = yol === GIRIS;
  const [diger, setDiger] = useState(false);
  const [ben, setBen] = useState<Ben | null>(null);
  const [hata, setHata] = useState("");
  const audio = useRef<AudioContext | null>(null);
  const oncekiSayi = useRef<number | null>(null);
  const hazir = useHydrated();
  const is = useIslem();
  useEffect(() => {
    if (giris) return;
    let aktif = true;
    let sorgulaniyor = false;
    const sesiAc = () => {
      try {
        audio.current ??= new AudioContext();
        void audio.current.resume().catch(() => undefined);
      } catch { /* Ses desteği yoksa rozet bildirim vermeye devam eder. */ }
    };
    const oku = async () => {
      if (sorgulaniyor) return;
      sorgulaniyor = true;
      try {
        const b = await api<Ben>("/ben");
        if (!aktif) return;
        setBen(b); setHata("");
        if (oncekiSayi.current !== null && b.yeniTeklif > oncekiSayi.current && audio.current?.state === "running") {
          const a = audio.current;
          const ses = a.createOscillator();
          const seviye = a.createGain();
          ses.frequency.value = 740;
          seviye.gain.setValueAtTime(0.08, a.currentTime);
          seviye.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.16);
          ses.connect(seviye); seviye.connect(a.destination); ses.start(); ses.stop(a.currentTime + 0.18);
        }
        oncekiSayi.current = b.yeniTeklif;
      } catch (e) { if (aktif) setHata((e as Error).message); }
      finally { sorgulaniyor = false; }
    };
    document.addEventListener("pointerdown", sesiAc);
    document.addEventListener("keydown", sesiAc);
    window.addEventListener("panel-teklif-degisti", oku);
    void oku();
    // Görünürlük kontrolü yok: gizli sekmede de tarayıcının izin verdiği aralıklarla sorgulanır.
    const aralik = window.setInterval(oku, 30000);
    return () => {
      aktif = false; clearInterval(aralik);
      document.removeEventListener("pointerdown", sesiAc);
      document.removeEventListener("keydown", sesiAc);
      window.removeEventListener("panel-teklif-degisti", oku);
    };
  }, [giris]);
  useEffect(() => {
    if (giris) return;
    const isim = MENU.find((m) => yol.startsWith(m.yol))?.etiket || "Yönetim";
    document.title = `${ben?.yeniTeklif ? `(${ben.yeniTeklif}) ` : ""}${isim} · ${firma}`;
  }, [ben?.yeniTeklif, firma, giris, yol]);
  const cik = () => void is.calistir(async () => { await api("/cikis", "POST"); window.location.replace(GIRIS); });
  const bag = (m: (typeof MENU)[number], kapat = false) => <Link key={m.yol} href={m.yol}
    className="p-nav-item" aria-current={yol.startsWith(m.yol) ? "page" : undefined}
    onClick={() => { if (kapat) setDiger(false); }}>
    <m.ikon size={21} /><span>{m.etiket}</span>{m.rozet && !!ben?.yeniTeklif &&
      <span className="p-badge" data-yeni-teklif={ben.yeniTeklif}>{ben.yeniTeklif}</span>}
  </Link>;
  const cikis = <button type="button" className="p-nav-item" onClick={cik} disabled={!hazir || is.mesgul}>
    <LogOut size={21} />{is.mesgul ? "Çıkılıyor…" : "Çıkış"}</button>;
  const site = <a className="p-nav-item" href={SITE} target="_blank" rel="noopener"><ExternalLink size={21} />Siteyi gör</a>;
  const marka = <div className="p-brand">{logo &&
    <div className="p-brand-mark"><Resim url={logo} ad="" logo /></div>}
    <div><strong>{firma}</strong><span>Yönetim paneli</span></div></div>;
  return <><Toaster theme="dark" richColors position="top-right" />
    <div className="panel" data-hazir={hazir}>
    {giris ? <main className="p-login">{marka}{children}</main> : <>
      <aside className="p-sidebar">{marka}<nav aria-label="Yönetim menüsü">
        <p className="p-nav-label">Günlük işler</p>{MENU.slice(0, 3).map((m) => bag(m))}
        <p className="p-nav-label">Site yönetimi</p>{MENU.slice(3, 7).map((m) => bag(m))}
        <p className="p-nav-label">Hesap</p>{bag(MENU[7])}{site}
      </nav><div className="p-user"><strong>{ben?.ad || "Yönetici"}</strong>
        <span>{ben?.kullaniciAdi}</span>{cikis}<Hata hata={is.hata} /></div></aside>
      <div className="p-workspace"><header className="p-topbar"><span>Yönetim / {MENU.find((m) => yol.startsWith(m.yol))?.etiket}</span>
        <span className="p-top-user">{ben?.ad}</span></header>
        <main className="p-main"><Hata hata={hata} />{children}</main>
      </div>
      <nav className="p-bottom" aria-label="Mobil yönetim menüsü">{MENU.slice(0, 4).map((m) => bag(m))}
        <button type="button" className="p-nav-item" disabled={!hazir} aria-expanded={diger} onClick={() => setDiger(true)}>
          <MoreHorizontal size={22} /><span>Diğer</span></button>
      </nav>
      <Modal acik={diger} kapat={() => setDiger(false)} baslik="Diğer" cekmece>
        <nav className="p-more-nav">{MENU.slice(4).map((m) => bag(m, true))}{site}{cikis}</nav><Hata hata={is.hata} />
      </Modal>
    </>}
  </div></>;
}
