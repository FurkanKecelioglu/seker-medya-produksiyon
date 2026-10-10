"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { HIZMET_IKONLARI } from "@/lib/kategoriler";
import { ServiceIcon } from "@/components/site/Sections";
import { api } from "./api";
import { useHydrated, useIslem, useVeri } from "./hooks";
import { Modal } from "./Modal";
import { Alan, Baslik, Bos, Durum, Hata, Sil, Siralama, Yukleniyor } from "./ui";
import type { Hizmet } from "./types";

function HizmetFormu({ hizmet, kaydet, kapat }: {
  hizmet: Hizmet | null; kaydet: () => Promise<void>; kapat: () => void;
}) {
  const [ikon, setIkon] = useState(hizmet?.ikon || HIZMET_IKONLARI[0]);
  const [aktif, setAktif] = useState(hizmet?.aktif ?? true);
  const hazir = useHydrated();
  const is = useIslem();
  return <form method="post" aria-busy={is.mesgul} onSubmit={(e) => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    void is.calistir(async () => {
      await api(hizmet ? `/hizmetler/${hizmet.id}` : "/hizmetler", hizmet ? "PATCH" : "POST",
        { baslik: f.get("baslik"), ozet: f.get("ozet"), ikon, aktif });
      // Yenilenen kartı açan kullanıcıyı önceki kaydın gecikmiş kapanışı etkilememeli.
      kapat(); await kaydet(); toast.success("Hizmet kaydedildi.");
    });
  }}><Hata hata={is.hata} />
    <Alan ad="baslik" etiket="Başlık *" hata={is.hata}>
      <input type="text" id="baslik" name="baslik" required maxLength={80} defaultValue={hizmet?.baslik || ""} />
    </Alan>
    <Alan ad="ozet" etiket="Özet *" hata={is.hata}>
      <textarea id="ozet" name="ozet" required rows={3} maxLength={300} defaultValue={hizmet?.ozet || ""} />
    </Alan>
    <fieldset className="p-fieldset"><legend>İkon</legend><div className="p-icon-picker">
      {HIZMET_IKONLARI.map((ad) => <button type="button" key={ad} aria-label={ad} title={ad}
        aria-pressed={ikon === ad} onClick={() => setIkon(ad)}><ServiceIcon name={ad} /></button>)}
    </div><Hata hata={is.hata} alan="ikon" /></fieldset>
    <label className="p-check"><input type="checkbox" checked={aktif} onChange={(e) => setAktif(e.target.checked)} />Aktif</label>
    <div className="p-actions"><button type="submit" className="p-btn p-primary" disabled={!hazir || is.mesgul}>
      {is.mesgul ? "Kaydediliyor…" : "Hizmeti kaydet"}</button>
      <button type="button" className="p-btn" disabled={is.mesgul} onClick={kapat}>Vazgeç</button></div>
  </form>;
}

export function Services() {
  const { veri, hata, bekliyor, yenile } = useVeri<{ hizmetler: Hizmet[] }>("/hizmetler");
  const [secili, setSecili] = useState<Hizmet | null>(null);
  const [acik, setAcik] = useState(false);
  const hazir = useHydrated();
  return <>
    <Baslik baslik="Hizmetler" aciklama="Sitede sunduğunuz hizmetleri ve sıralarını düzenleyin.">
      <button type="button" className="p-btn p-primary" disabled={!hazir} onClick={() => { setSecili(null); setAcik(true); }}>
        <Plus size={19} />Hizmet ekle</button></Baslik>
    <Hata hata={hata} />{bekliyor && !veri ? <Yukleniyor /> : veri && <>
      <p className="p-help">Toplam {veri.hizmetler.length} hizmet</p>
      {veri.hizmetler.length ? <div className="p-list">{veri.hizmetler.map((h, i) =>
        <article key={h.id} className={`p-card p-service ${h.aktif ? "" : "p-dim"}`} data-hizmet-id={h.id}>
          <div className="p-card-top"><div className="p-actions"><ServiceIcon name={h.ikon} /><h2>{h.baslik}</h2></div>
            <Durum kod={h.aktif ? "AKTIF" : "PASIF"} metin={h.aktif ? "Aktif" : "Pasif"} /></div>
          <p className="p-help">{h.ozet}</p><div className="p-card-top p-row-actions">
            <Siralama index={i} liste={veri.hizmetler} tur="hizmet" sonra={yenile} />
            <div className="p-actions"><button type="button" className="p-btn"
              onClick={() => { setSecili(h); setAcik(true); }}><Pencil size={17} />Düzenle</button>
              <Sil yol={`/hizmetler/${h.id}`} ad={h.baslik} sonra={yenile} /></div>
          </div></article>)}</div> : <Bos metin="Henüz hizmet eklenmedi." />}
    </>}
    <Modal acik={acik} kapat={() => setAcik(false)} baslik={secili ? "Hizmet düzenle" : "Hizmet ekle"}>
      <HizmetFormu hizmet={secili} kaydet={yenile} kapat={() => setAcik(false)} />
    </Modal>
  </>;
}
