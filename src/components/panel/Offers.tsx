"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Phone, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { TEKLIF_DURUMLARI } from "@/lib/kategoriler";
import { api } from "./api";
import { useHydrated, useIslem, useVeri } from "./hooks";
import { Alan, Baslik, Bos, Durum, Hata, Sayfalama, Yukleniyor } from "./ui";
import type { Sayfali, Talep } from "./types";

type Cevap = Sayfali & { talepler: Talep[]; durumlar: { kod: string; ad: string; adet: number }[] };

function TalepKarti({ talep: t, yenile }: { talep: Talep; yenile: () => Promise<void> }) {
  const [devami, setDevami] = useState(false);
  const [uzun, setUzun] = useState(false);
  const mesajRef = useRef<HTMLParagraphElement>(null);
  const [not, setNot] = useState(t.icNot || "");
  const is = useIslem();
  const hazir = useHydrated();
  useEffect(() => {
    const el = mesajRef.current;
    if (!el || devami) return;
    let aktif = true;
    // Kısa ama çok satırlı bir mesaj da taşabilir; karakter sayısı bunu göstermez.
    const olc = () => { if (aktif) setUzun(el.scrollHeight > el.clientHeight + 1); };
    const observer = new ResizeObserver(olc);
    observer.observe(el);
    void document.fonts.ready.then(olc);
    return () => { aktif = false; observer.disconnect(); };
  }, [devami, t.mesaj]);
  const kaydet = (veri: object) => void is.calistir(async () => {
    await api(`/teklifler/${t.id}`, "PATCH", veri);
    await yenile(); window.dispatchEvent(new Event("panel-teklif-degisti")); toast.success("Talep güncellendi.");
  });
  return <article className="p-card p-offer" data-talep-id={t.id}>
    <div className="p-card-top"><div><h2>{t.ad}</h2><p className="p-help">{t.olusturmaMetni}</p></div><Durum kod={t.durum} /></div>
    <div className="p-offer-meta">{t.hizmet && <span>{t.hizmet}</span>}
      {t.etkinlikTarihiMetni && <span>{t.etkinlikTarihiMetni}</span>}{t.firma && <span>{t.firma}</span>}
    </div>
    <div className="p-contact-actions">
      <a className="p-btn p-whatsapp" href={t.whatsappLinki} target="_blank" rel="noopener">
        <MessageCircle size={21} />WhatsApp&apos;tan yaz</a>
      <a className="p-btn" href={t.telefonLinki}><Phone size={20} />Ara</a>
    </div>
    <p className="p-help">{t.telefonMetni}{t.eposta && <> · <a href={`mailto:${t.eposta}`}>{t.eposta}</a></>}</p>
    <p ref={mesajRef} className={`p-message ${devami ? "" : "p-clamp"}`}>{t.mesaj}</p>
    {uzun && <button type="button" className="p-text-btn" onClick={() => setDevami(!devami)}>
      {devami ? "Daha az" : "devamı"}</button>}
    <div className="p-offer-edit"><Alan ad={`durum-${t.id}`} etiket="Talep durumu">
      <select id={`durum-${t.id}`} value={t.durum} disabled={!hazir || is.mesgul}
        onChange={(e) => kaydet({ durum: e.target.value })}>
        {TEKLIF_DURUMLARI.map((d) => <option key={d.kod} value={d.kod}>{d.ad}</option>)}
      </select></Alan>
      <form method="post" onSubmit={(e) => { e.preventDefault(); kaydet({ icNot: not }); }}>
        <Alan ad={`icNot-${t.id}`} etiket="İç not" yardim="Yalnız panelde görünür.">
          <textarea id={`icNot-${t.id}`} name="icNot" rows={3} maxLength={3000} value={not}
            disabled={is.mesgul} onChange={(e) => setNot(e.target.value)} />
        </Alan>
        <button type="submit" className="p-btn" disabled={!hazir || is.mesgul || not === (t.icNot || "")}>
          {is.mesgul ? "Kaydediliyor…" : "Notu kaydet"}</button>
      </form>
    </div><Hata hata={is.hata?.message || null} />
  </article>;
}

export function Offers() {
  const hazir = useHydrated();
  const [durum, setDurum] = useState("YENI");
  const [sayfa, setSayfa] = useState(1);
  const { veri, hata, bekliyor, yenile } = useVeri<Cevap>(`/teklifler?durum=${durum}&sayfa=${sayfa}`);
  return <>
    <Baslik baslik="Teklif talepleri" aciklama="Yeni taleplere dönün, görüşmelerinizi takip edin.">
      <button type="button" className="p-btn" disabled={bekliyor} onClick={() => void yenile()}>
        <RefreshCw size={18} />Yenile</button>
    </Baslik>
    <div className="p-tabs" role="tablist" aria-label="Teklif durumları">
      {(veri?.durumlar || TEKLIF_DURUMLARI.map((d) => ({ ...d, adet: 0 }))).map((d) =>
        <button type="button" key={d.kod} role="tab" aria-selected={durum === d.kod} data-durum={d.kod}
          disabled={!hazir}
          onClick={() => { setDurum(d.kod); setSayfa(1); }}>
          {d.ad}<span>{d.adet}</span></button>)}
    </div>
    <Hata hata={hata} />{bekliyor ? <Yukleniyor /> : veri && <>
      <Sayfalama veri={veri} isim="talep" degistir={setSayfa} mesgul={bekliyor} />
      {veri.talepler.length ? <div className="p-offers">{veri.talepler.map((t) =>
        <TalepKarti key={`${t.id}-${t.icNot}`} talep={t} yenile={yenile} />)}</div> : <Bos metin="Bu durumda teklif talebi yok." />}
      {veri.talepler.length > 5 && <Sayfalama veri={veri} isim="talep" degistir={setSayfa} mesgul={bekliyor} />}
    </>}
  </>;
}
