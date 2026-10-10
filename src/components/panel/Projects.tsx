"use client";

import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { kategoriAdi } from "@/lib/kategoriler";
import { useVeri } from "./hooks";
import { projeYolu } from "./menu";
import { Baslik, Bos, Durum, Hata, Resim, Siralama, Yukleniyor } from "./ui";
import type { Proje } from "./types";

export function Projects() {
  const { veri, hata, bekliyor, yenile } = useVeri<{ projeler: Proje[]; oneCikanSiniri: number }>("/projeler");
  return <>
    <Baslik baslik="Projeler" aciklama="Portföyünüzü düzenleyin, hazır projeleri yayına alın.">
      <Link className="p-btn p-primary" href={projeYolu("yeni")}><Plus size={19} />Yeni proje</Link>
    </Baslik><Hata hata={hata} />{bekliyor && !veri ? <Yukleniyor /> : veri && <>
      {veri.projeler.filter((p) => p.oneCikan).length > veri.oneCikanSiniri &&
        <p className="p-notice">Sitede yalnız ilk {veri.oneCikanSiniri} öne çıkan proje gösterilir.</p>}
      <p className="p-help">Toplam {veri.projeler.length} proje</p>
      {veri.projeler.length ? <div className="p-list">{veri.projeler.map((p, i) =>
        <article className="p-card p-list-row" key={p.id} data-proje-id={p.id}>
          <div className="p-list-image"><Resim url={p.kapak?.url || p.video?.kucukResim} ad={p.baslik} /></div>
          <div><Link className="p-list-title" href={projeYolu(p.id)}>{p.baslik}</Link>
            <p className="p-help">{kategoriAdi(p.kategori)}{p.yil ? ` · ${p.yil}` : ""}</p>
            <Durum kod={p.yayinda ? "YAYINDA" : "TASLAK"} metin={p.yayinda ? "Yayında" : "Taslak"} />
            {p.oneCikan && <span className="p-status"><Star size={15} />Öne çıkan</span>}
          </div><Siralama index={i} liste={veri.projeler} tur="proje" sonra={yenile} />
        </article>)}</div> : <Bos metin="İlk projenizi ekleyerek başlayın." />}
    </>}
  </>;
}
