"use client";

import { Upload } from "lucide-react";
import { toast } from "sonner";
import { api } from "./api";
import { useHydrated, useIslem } from "./hooks";
import { dosyaKontrolu, FOTO_ACCEPT, VIDEO_ACCEPT } from "./Photos";
import { Hata, Resim, Sil } from "./ui";
import type { Medya } from "./types";

export function MediaUpload({ yol, medya, etiket, video = false, yenile }: {
  yol: string; medya: Medya | null; etiket: string; video?: boolean; yenile: () => Promise<void>;
}) {
  const is = useIslem();
  const hazir = useHydrated();
  return <div className="p-cover">
    {video ? medya && <video key={medya.url} src={medya.url} controls muted preload="metadata" /> :
      <Resim key={medya?.url || "bos"} url={medya?.url} ad={etiket} />}
    <p className="p-help">{video ? "MP4, WebM · En fazla 25 MB" : "JPG, PNG, WebP, AVIF · En fazla 20 MB"}</p>
    <div className="p-actions">
      <label className={`p-btn p-upload ${!hazir || is.mesgul ? "p-disabled" : ""}`}>
        <Upload size={18} />{is.mesgul ? "Yükleniyor…" : medya ? "Değiştir" : "Yükle"}
        <input type="file" aria-label={`${etiket} yükle`} accept={video ? VIDEO_ACCEPT : FOTO_ACCEPT}
          disabled={!hazir || is.mesgul} onChange={(e) => {
            const dosya = e.target.files?.[0]; e.target.value = "";
            if (!dosya) return;
            void is.calistir(async () => {
              dosyaKontrolu(dosya, video);
              const form = new FormData(); form.set("dosya", dosya);
              await api(yol, "POST", form); await yenile(); toast.success("Dosya yüklendi.");
            });
          }} />
      </label>
      {medya && !is.mesgul && <Sil yol={yol} ad={`${etiket} kaldırılacak`} sonra={yenile} />}
    </div><Hata hata={is.hata?.message || null} />
  </div>;
}
