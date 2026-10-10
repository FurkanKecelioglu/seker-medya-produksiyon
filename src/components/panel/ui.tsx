"use client";

import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ImageOff, Inbox, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TEKLIF_DURUMLARI } from "@/lib/kategoriler";
import { api, type ApiHatasi } from "./api";
import { useHydrated, useIslem } from "./hooks";
import { Modal } from "./Modal";
import type { Sayfali } from "./types";

export function Baslik({ baslik, aciklama, children }: { baslik: string; aciklama: string; children?: ReactNode }) {
  return <div className="p-heading"><div><h1>{baslik}</h1><p>{aciklama}</p></div>{children}</div>;
}

export function Hata({ hata, alan }: { hata: ApiHatasi | string | null; alan?: string }) {
  if (!hata) return null;
  if (typeof hata !== "string" && (alan ? hata.alan !== alan : !!hata.alan)) return null;
  return <p className="p-error" role="alert">{typeof hata === "string" ? hata : hata.message}</p>;
}

export function Alan({ ad, etiket, children, hata, yardim }: {
  ad: string; etiket: string; children: ReactNode; hata?: ApiHatasi | null; yardim?: string;
}) {
  return <div className="p-field"><label htmlFor={ad}>{etiket}</label>{children}
    {yardim && <p className="p-help">{yardim}</p>}<Hata hata={hata ?? null} alan={ad} /></div>;
}

export function Durum({ kod, metin }: { kod: string; metin?: string }) {
  const ad = metin || TEKLIF_DURUMLARI.find((d) => d.kod === kod)?.ad || kod;
  return <span className={`p-status p-status-${kod.toLowerCase()}`}><span aria-hidden="true" />{ad}</span>;
}

export function Bos({ metin }: { metin: string }) {
  return <div className="p-empty"><Inbox size={36} strokeWidth={1.4} /><p>{metin}</p></div>;
}

export function Yukleniyor() { return <p className="p-loading" role="status">Yükleniyor…</p>; }

export function Sayfalama({ veri, isim, degistir, mesgul }: {
  veri: Sayfali; isim: string; degistir: (n: number) => void; mesgul: boolean;
}) {
  const sayfalar = Math.max(1, Math.ceil(veri.toplam / veri.sayfaBoyu));
  return <div className="p-pagination"><p>{veri.toplam} {isim} · sayfa {veri.sayfa}/{sayfalar}</p>
    <div className="p-actions">
      <button type="button" className="p-btn" disabled={mesgul || veri.sayfa <= 1}
        onClick={() => degistir(veri.sayfa - 1)}>Önceki</button>
      <button type="button" className="p-btn" disabled={mesgul || veri.sayfa >= sayfalar}
        onClick={() => degistir(veri.sayfa + 1)}>Sonraki</button>
    </div></div>;
}

export function Resim({ url, ad, logo = false }: { url?: string | null; ad: string; logo?: boolean }) {
  const [bozuk, setBozuk] = useState(false);
  return <div className={`p-image ${logo ? "p-logo-image" : ""}`}>
    {url && !bozuk ? (
      // Sabit ölçüler yükleme sırasında kartı korur; hatalı URL kırık ikon yerine yer tutucuya döner.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={ad} width={640} height={360} loading="lazy" onError={() => setBozuk(true)} />
    ) : <span className="p-placeholder"><ImageOff size={28} /><span>{ad}</span></span>}
  </div>;
}

export function Sil({ yol, ad, sonra, aciklama }: {
  yol: string; ad: string; sonra: () => Promise<void>; aciklama?: string;
}) {
  const [acik, setAcik] = useState(false);
  const is = useIslem();
  const hazir = useHydrated();
  return <>
    <button type="button" className="p-btn p-danger" onClick={() => setAcik(true)} disabled={!hazir}>
      <Trash2 size={17} />Sil
    </button>
    <Modal acik={acik} kapat={() => setAcik(false)} baslik="Silme onayı" mesgul={is.mesgul}>
      <p className="p-confirm-name">{ad}</p>
      <p className="p-help">{aciklama || "Bu kayıt silinir, geri alınamaz."}</p>
      <Hata hata={is.hata} />
      <div className="p-actions p-modal-actions">
        <button type="button" className="p-btn" disabled={is.mesgul} onClick={() => setAcik(false)}>Vazgeç</button>
        <button type="button" className="p-btn p-danger" disabled={is.mesgul} onClick={() => void is.calistir(async () => {
          await api(yol, "DELETE"); await sonra(); setAcik(false); toast.success("Kayıt silindi.");
        })}>{is.mesgul ? "Siliniyor…" : "Evet, sil"}</button>
      </div>
    </Modal>
  </>;
}

export function Siralama({ index, liste, tur, sonra }: {
  index: number; liste: { id: number }[]; tur: string; sonra: () => Promise<void>;
}) {
  const is = useIslem();
  const hazir = useHydrated();
  const tasi = (yon: number) => void is.calistir(async () => {
    const idler = liste.map((r) => r.id);
    [idler[index], idler[index + yon]] = [idler[index + yon], idler[index]];
    await api("/siralama", "PUT", { tur, idler }); await sonra(); toast.success("Sıra kaydedildi.");
  });
  return <div><div className="p-actions">
    <button type="button" className="p-icon" aria-label="Yukarı taşı" disabled={!hazir || is.mesgul || index === 0}
      onClick={() => tasi(-1)}><ArrowUp size={18} /></button>
    <button type="button" className="p-icon" aria-label="Aşağı taşı"
      disabled={!hazir || is.mesgul || index === liste.length - 1} onClick={() => tasi(1)}><ArrowDown size={18} /></button>
  </div><Hata hata={is.hata} /></div>;
}
