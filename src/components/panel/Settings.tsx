"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { api } from "./api";
import { useAyrilmaUyarisi, useHydrated, useIslem, useVeri } from "./hooks";
import { Alan, Baslik, Hata, Yukleniyor } from "./ui";
import { MediaUpload } from "./MediaUpload";
import type { Ayarlar } from "./types";

// Yalnız gruplama bilgisidir; alanların kendisi her zaman API sözleşmesinden gelir.
const GRUP: Record<string, string> = {
  firma_adi: "Firma", slogan: "Açılış", alt_slogan: "Açılış", konum_satiri: "Açılış", guven_satiri: "Açılış",
  kisa_tanitim_baslik: "Ana sayfa metinleri", kisa_tanitim: "Ana sayfa metinleri", surec_adimlari: "Ana sayfa metinleri",
  hakkimizda: "Firma", canli_yayin_baslik: "Ana sayfa metinleri", canli_yayin_metni: "Ana sayfa metinleri",
  drone_baslik: "Ana sayfa metinleri", drone_metni: "Ana sayfa metinleri", cagri_baslik: "Ana sayfa metinleri",
  cagri_metni: "Ana sayfa metinleri", telefon: "İletişim", whatsapp: "İletişim", eposta: "İletişim", adres: "İletişim",
  harita_link: "İletişim", instagram: "Sosyal medya", youtube: "Sosyal medya", facebook: "Sosyal medya",
  linkedin: "Sosyal medya", seo_baslik: "Arama motoru", seo_aciklama: "Arama motoru", showreel: "Ana sayfa metinleri",
};

function MetinFormu({ veri, yenile }: { veri: Ayarlar; yenile: () => Promise<void> }) {
  const [degerler, setDegerler] = useState(veri.metin);
  const [kayitli, setKayitli] = useState(veri.metin);
  const is = useIslem();
  const hazir = useHydrated();
  const farklar = Object.fromEntries(Object.entries(degerler).filter(([k, v]) => v !== kayitli[k]));
  const degisen = Object.keys(farklar).length;
  useAyrilmaUyarisi(degisen > 0);
  const gruplar = Array.from(new Set(veri.alanlar.metin.map((a) => GRUP[a.anahtar] || "Diğer")));
  return <form method="post" onSubmit={(e) => {
    e.preventDefault(); if (!degisen) return;
    void is.calistir(async () => {
      await api("/ayarlar", "PATCH", farklar);
      setKayitli({ ...degerler }); await yenile(); toast.success("Ayarlar kaydedildi.");
    });
  }}><Hata hata={is.hata} />
    {gruplar.map((grup) => <section className="p-card p-settings-group" key={grup}><h2>{grup}</h2>
      <div className="p-form-grid">{veri.alanlar.metin.filter((a) => (GRUP[a.anahtar] || "Diğer") === grup).map((a) => {
        const ortak = { id: a.anahtar, name: a.anahtar, maxLength: a.enUzun, value: degerler[a.anahtar] || "",
          disabled: is.mesgul, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setDegerler((d) => ({ ...d, [a.anahtar]: e.target.value })) };
        return <div key={a.anahtar} className={a.enUzun > 200 ? "p-full" : ""}>
          <Alan ad={a.anahtar} etiket={a.etiket} hata={is.hata}>
            {a.enUzun > 200 ? <textarea {...ortak} rows={4} /> : <input type="text" {...ortak} />}
            <p className="p-counter">{ortak.value.length} / {a.enUzun}</p>
          </Alan></div>;
      })}</div></section>)}
    <div className="p-save-bar"><span>{degisen ? `${degisen} alan değişti` : "Tüm değişiklikler kaydedildi"}</span>
      <button type="submit" className="p-btn p-primary" disabled={!hazir || is.mesgul || !degisen}>
        <Save size={18} />{is.mesgul ? "Kaydediliyor…" : "Değişiklikleri kaydet"}</button>
    </div>
  </form>;
}

export function Settings() {
  const { veri, hata, bekliyor, yenile } = useVeri<Ayarlar>("/ayarlar");
  return <><Baslik baslik="Site ayarları" aciklama="Firma bilgileri, metinler ve görseller; hepsi bir yerde." />
    <Hata hata={hata} />{bekliyor && !veri ? <Yukleniyor /> : veri && <>
      <MetinFormu veri={veri} yenile={yenile} />
      <section className="p-cover"><h2>Görseller ve videolar</h2><div className="p-media-grid">
        {veri.alanlar.medya.map((a) => <article className="p-card" key={a.anahtar} data-medya={a.anahtar}>
          <h3>{a.etiket}</h3><MediaUpload yol={`/ayarlar/medya/${a.anahtar}`} medya={veri.medya[a.anahtar] || null}
            etiket={a.etiket} video={a.tur === "video"} yenile={yenile} />
        </article>)}
      </div></section>
    </>}
  </>;
}
