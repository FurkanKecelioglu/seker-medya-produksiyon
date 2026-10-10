"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { api } from "./api";
import { useHydrated, useIslem, useVeri } from "./hooks";
import { Alan, Bos, Hata, Resim, Sil, Siralama, Yukleniyor } from "./ui";
import type { Foto } from "./types";

export const FOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
export const VIDEO_ACCEPT = "video/mp4,video/webm";

export function dosyaKontrolu(dosya: File, video = false) {
  const turler = (video ? VIDEO_ACCEPT : FOTO_ACCEPT).split(",");
  if (!turler.includes(dosya.type)) throw new Error(video ? "MP4 veya WebM seçin." : "JPG, PNG, WebP veya AVIF seçin.");
  if (dosya.size > (video ? 25 : 20) * 1024 * 1024) throw new Error(`Dosya en fazla ${video ? 25 : 20} MB olabilir.`);
}

type Yukleme = { ad: string; durum: string; hata?: string };

function FotoKarti({ foto: f, index, liste, yenile }: {
  foto: Foto; index: number; liste: Foto[]; yenile: () => Promise<void>;
}) {
  const [aciklama, setAciklama] = useState(f.aciklama || "");
  const [galeride, setGaleride] = useState(f.galeride);
  const hazir = useHydrated();
  const is = useIslem();
  return <article className="p-card p-photo" data-foto-id={f.id}>
    <Resim key={f.url} url={f.url} ad={f.aciklama || `Fotoğraf ${index + 1}`} />
    <form method="post" onSubmit={(e) => {
      e.preventDefault(); void is.calistir(async () => {
        await api(`/fotolar/${f.id}`, "PATCH", { aciklama, galeride }); await yenile(); toast.success("Fotoğraf kaydedildi.");
      });
    }}><Alan ad={`aciklama-${f.id}`} etiket="Fotoğraf açıklaması" hata={is.hata}>
        <input type="text" id={`aciklama-${f.id}`} maxLength={200} value={aciklama}
          disabled={is.mesgul} onChange={(e) => setAciklama(e.target.value)} />
      </Alan>
      <label className="p-check"><input type="checkbox" checked={galeride} disabled={is.mesgul}
        onChange={(e) => setGaleride(e.target.checked)} />Galeride göster</label>
      <Hata hata={is.hata?.message || null} />
      <button type="submit" className="p-btn" disabled={!hazir || is.mesgul ||
        (aciklama === (f.aciklama || "") && galeride === f.galeride)}>Kaydet</button>
    </form>
    <div className="p-card-top"><Siralama index={index} liste={liste} tur="foto" sonra={yenile} />
      <Sil yol={`/fotolar/${f.id}`} ad={f.aciklama || `Fotoğraf ${index + 1}`} sonra={yenile} /></div>
  </article>;
}

export function Photos({ proje = "galeri" }: { proje?: number | "galeri" }) {
  const { veri, hata, bekliyor, yenile } = useVeri<{ fotolar: Foto[]; toplam: number }>(`/fotolar?proje=${proje}`);
  const [yuklemeler, setYuklemeler] = useState<Yukleme[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const kilit = useRef(false);
  const hazir = useHydrated();
  async function yukle(dosyalar: File[]) {
    if (kilit.current || !dosyalar.length) return;
    kilit.current = true; setYukleniyor(true);
    setYuklemeler(dosyalar.map((d) => ({ ad: d.name, durum: "bekliyor" })));
    const durum = (i: number, durum: string, hata?: string) => setYuklemeler((once) =>
      once.map((r, n) => n === i ? { ...r, durum, hata } : r));
    try {
      for (const [i, dosya] of dosyalar.entries()) {
        durum(i, "yükleniyor");
        try {
          dosyaKontrolu(dosya);
          const form = new FormData(); form.set("dosya", dosya);
          if (proje !== "galeri") form.set("projeId", String(proje));
          await api("/fotolar", "POST", form); durum(i, "tamam");
          await yenile();
        } catch (e) { durum(i, "hata", (e as Error).message); }
      }
    } finally { kilit.current = false; setYukleniyor(false); }
  }
  return <section className="p-photo-section"><div className="p-section-heading">
    <div><h2>Fotoğraflar</h2><p className="p-help">Toplam {veri?.toplam ?? "…"} fotoğraf</p></div>
    <label className={`p-btn p-primary p-upload ${!hazir || yukleniyor ? "p-disabled" : ""}`}>
      <Upload size={18} />{yukleniyor ? "Yükleniyor…" : "Fotoğraf yükle"}
      <input type="file" accept={FOTO_ACCEPT} multiple aria-label="Fotoğraf yükle" disabled={!hazir || yukleniyor}
        onChange={(e) => { void yukle(Array.from(e.target.files || [])); e.target.value = ""; }} />
    </label>
  </div><p className="p-help">Birlikte seçebilirsiniz; dosyalar sırayla yüklenir. JPG, PNG, WebP, AVIF · Her dosya en fazla 20 MB.</p>
    {yuklemeler.length > 0 && <ul className="p-upload-list" aria-live="polite">{yuklemeler.map((r, i) =>
      <li key={i} data-yukleme-durum={r.durum}><span>{r.ad}</span><strong>{r.durum}</strong>
        {r.hata && <p className="p-error">{r.hata}</p>}</li>)}</ul>}
    <Hata hata={hata} />{bekliyor && !veri ? <Yukleniyor /> : veri && (veri.fotolar.length ?
      <div className="p-photo-grid">{veri.fotolar.map((f, i) =>
        <FotoKarti key={`${f.id}-${f.aciklama}-${f.galeride}`} foto={f} index={i} liste={veri.fotolar} yenile={yenile} />)}</div> :
      <Bos metin="Henüz fotoğraf yüklenmedi." />)}
  </section>;
}
