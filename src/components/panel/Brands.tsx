"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { api } from "./api";
import { useHydrated, useIslem, useVeri } from "./hooks";
import { Modal } from "./Modal";
import { Alan, Baslik, Bos, Durum, Hata, Resim, Sil, Siralama, Yukleniyor } from "./ui";
import { MediaUpload } from "./MediaUpload";
import { dosyaKontrolu, FOTO_ACCEPT } from "./Photos";
import type { Marka } from "./types";

function MarkaFormu({ marka, kaydet, kapat }: { marka: Marka | null; kaydet: () => Promise<void>; kapat: () => void }) {
  const hazir = useHydrated();
  const is = useIslem();
  return <form method="post" aria-busy={is.mesgul} onSubmit={(e) => {
    e.preventDefault(); const form = new FormData(e.currentTarget);
    void is.calistir(async () => {
      if (!marka) {
        const logo = form.get("logo");
        if (logo instanceof File && logo.size) dosyaKontrolu(logo);
      }
      await api(marka ? `/markalar/${marka.id}` : "/markalar", marka ? "PATCH" : "POST",
        marka ? { ad: form.get("ad"), url: form.get("url") } : form);
      // Liste yenilenirken açılan başka bir pencereyi bu kayıt sonradan kapatmamalı.
      kapat(); await kaydet(); toast.success("Marka kaydedildi.");
    });
  }}><Hata hata={is.hata} />
    <Alan ad="ad" etiket="Marka adı *" hata={is.hata}>
      <input type="text" id="ad" name="ad" required maxLength={120} defaultValue={marka?.ad || ""} />
    </Alan>
    <Alan ad="url" etiket="Bağlantı" hata={is.hata}>
      <input type="url" id="url" name="url" maxLength={300} defaultValue={marka?.url || ""} placeholder="https://" />
    </Alan>
    {!marka && <Alan ad="logo" etiket="Logo" yardim="JPG, PNG, WebP, AVIF · En fazla 20 MB">
      <input type="file" id="logo" name="logo" accept={FOTO_ACCEPT} /></Alan>}
    <div className="p-actions"><button type="submit" className="p-btn p-primary" disabled={!hazir || is.mesgul}>
      {is.mesgul ? "Kaydediliyor…" : "Markayı kaydet"}</button>
      <button type="button" className="p-btn" disabled={is.mesgul} onClick={kapat}>Vazgeç</button></div>
  </form>;
}

function MarkaKarti({ marka: m, liste, index, yenile, duzenle }: {
  marka: Marka; liste: Marka[]; index: number; yenile: () => Promise<void>; duzenle: () => void;
}) {
  const is = useIslem();
  const hazir = useHydrated();
  const [aktif, setAktif] = useState(m.aktif);
  return <article className={`p-card ${m.aktif ? "" : "p-dim"}`} data-marka-id={m.id}>
    <div className="p-card-top"><h2>{m.ad}</h2><Durum kod={m.aktif ? "AKTIF" : "PASIF"} metin={m.aktif ? "Aktif" : "Pasif"} /></div>
    {m.url && <a href={m.url} target="_blank" rel="noopener" className="p-text-btn">{m.url}</a>}
    <div className="p-brand-logo"><Resim key={m.logo?.url || "bos"} url={m.logo?.url} ad={m.ad} logo /></div>
    <label className="p-check"><input type="checkbox" checked={aktif} disabled={!hazir || is.mesgul}
      onChange={(e) => {
        const aktif = e.target.checked;
        setAktif(aktif);
        void is.calistir(async () => {
          try {
            await api(`/markalar/${m.id}`, "PATCH", { aktif }); await yenile(); toast.success("Marka güncellendi.");
          } catch (e) { setAktif(m.aktif); throw e; }
        });
      }} />Aktif</label><Hata hata={is.hata?.message || null} />
    <details className="p-brand-media"><summary>Logoyu değiştir / kaldır</summary>
      <MediaUpload yol={`/markalar/${m.id}/logo`} medya={m.logo} etiket={`${m.ad} logosu`} yenile={yenile} />
    </details>
    <div className="p-card-top p-row-actions"><Siralama index={index} liste={liste} tur="marka" sonra={yenile} />
      <div className="p-actions"><button type="button" className="p-btn" onClick={duzenle}><Pencil size={17} />Düzenle</button>
        <Sil yol={`/markalar/${m.id}`} ad={m.ad} sonra={yenile} /></div></div>
  </article>;
}

export function Brands() {
  const { veri, hata, bekliyor, yenile } = useVeri<{ markalar: Marka[] }>("/markalar");
  const [secili, setSecili] = useState<Marka | null>(null);
  const [acik, setAcik] = useState(false);
  const hazir = useHydrated();
  return <><Baslik baslik="Markalar" aciklama="Birlikte çalıştığınız markaları sitede gösterin.">
    <button type="button" className="p-btn p-primary" disabled={!hazir} onClick={() => { setSecili(null); setAcik(true); }}>
      <Plus size={19} />Marka ekle</button></Baslik>
    <Hata hata={hata} />{bekliyor && !veri ? <Yukleniyor /> : veri && <>
      <p className="p-help">Toplam {veri.markalar.length} marka</p>
      {veri.markalar.length ? <div className="p-photo-grid">{veri.markalar.map((m, i) =>
        <MarkaKarti key={`${m.id}-${m.aktif}`} marka={m} liste={veri.markalar} index={i} yenile={yenile}
          duzenle={() => { setSecili(m); setAcik(true); }} />)}</div> : <Bos metin="Henüz marka eklenmedi." />}
    </>}
    <Modal acik={acik} kapat={() => setAcik(false)} baslik={secili ? "Marka düzenle" : "Marka ekle"}>
      <MarkaFormu marka={secili} kaydet={yenile} kapat={() => setAcik(false)} />
    </Modal>
  </>;
}
