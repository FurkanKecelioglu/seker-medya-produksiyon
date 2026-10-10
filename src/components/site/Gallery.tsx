"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { Visual } from "./Visual";
import { useModal } from "./useModal";
import { useHydrated } from "./useHydrated";

type Photo = {
  id: number; url: string; genislik: number | null; yukseklik: number | null; aciklama: string | null;
  proje?: { adres: string; baslik: string } | null;
};

export function Gallery({ photos, title = "Galeri" }: { photos: Photo[]; title?: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const hydrated = useHydrated();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const touch = useRef<number | null>(null);
  const active = index !== null;

  useModal(active, dialog, opener);

  const move = (direction: number) => setIndex((i) => i === null ? null : (i + direction + photos.length) % photos.length);

  if (!photos.length) return (
    <div className="empty-state"><h2>Henüz fotoğraf yok</h2><Link href="/projeler">Projeleri inceleyin</Link></div>
  );

  return (
    <>
      <div className="gallery-columns">
        {photos.map((p, i) => (
          <figure key={p.id}>
            <button type="button" className="gallery-open" disabled={!hydrated}
              aria-label={`${p.aciklama || title} — fotoğraf ${i + 1}, büyüt`}
              onClick={(e) => { opener.current = e.currentTarget; setIndex(i); }}>
              <Visual image={p} alt={p.aciklama || `${title} — fotoğraf ${i + 1}`} natural
                sizes="(max-width: 767px) 100vw, (max-width: 1099px) 50vw, 33vw" />
              <span className="gallery-expand"><Expand size={20} aria-hidden="true" /></span>
            </button>
            {(p.aciklama || p.proje) && <figcaption>
              {p.aciklama && <span>{p.aciklama}</span>}
              {p.proje && <Link href={p.proje.adres}>{p.proje.baslik}</Link>}
            </figcaption>}
          </figure>
        ))}
      </div>
      <dialog ref={dialog} className="lightbox" aria-label="Fotoğraf görüntüleyici" onCancel={() => setIndex(null)}
        onClose={() => setIndex(null)} onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
          if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
        }}>
        {index !== null && <>
          <div className="lightbox-top">
            <span aria-live="polite">{index + 1} / {photos.length}</span>
            <button type="button" className="icon-button" onClick={() => setIndex(null)} aria-label="Görüntüleyiciyi kapat">
              <X aria-hidden="true" />
            </button>
          </div>
          <div className="lightbox-image" onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touch.current === null) return;
              const delta = e.changedTouches[0].clientX - touch.current;
              if (Math.abs(delta) > 45) move(delta > 0 ? -1 : 1);
              touch.current = null;
            }}>
            <Visual image={photos[index]} alt={photos[index].aciklama || `${title} — fotoğraf ${index + 1}`} sizes="100vw" />
          </div>
          <div className="lightbox-bottom">
            <button type="button" className="icon-button" onClick={() => move(-1)} aria-label="Önceki fotoğraf">
              <ArrowLeft aria-hidden="true" />
            </button>
            <p aria-live="polite">{photos[index].aciklama || title}</p>
            <button type="button" className="icon-button" onClick={() => move(1)} aria-label="Sonraki fotoğraf">
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </>}
      </dialog>
    </>
  );
}
