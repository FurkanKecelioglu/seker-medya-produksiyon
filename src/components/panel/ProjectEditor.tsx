"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Save } from "lucide-react";
import { toast } from "sonner";
import { KATEGORILER } from "@/lib/kategoriler";
import { api, ApiHatasi } from "./api";
import { useHydrated, useIslem, useVeri } from "./hooks";
import { panelYolu, projeYolu } from "./menu";
import { Alan, Baslik, Durum, Hata, Sil, Yukleniyor } from "./ui";
import { Photos } from "./Photos";
import { MediaUpload } from "./MediaUpload";
import type { Proje } from "./types";

function ProjeFormu({ proje, yenile }: { proje: Proje | null; yenile?: () => Promise<void> }) {
  const [yayinda, setYayinda] = useState(proje?.yayinda || false);
  const [oneCikan, setOneCikan] = useState(proje?.oneCikan || false);
  const hazir = useHydrated();
  const is = useIslem();
  const router = useRouter();
  return <form method="post" className="p-card" onSubmit={(e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const veri = { ...Object.fromEntries(f), yil: f.get("yil") ? Number(f.get("yil")) : null,
      oneCikan, yayinda: proje ? yayinda : false };
    void is.calistir(async () => {
      let p: Proje;
      try { p = await api<Proje>(proje ? `/projeler/${proje.id}` : "/projeler", proje ? "PATCH" : "POST", veri); }
      catch (e) {
        if (e instanceof ApiHatasi && e.durum === 409) e.alan = "slug";
        throw e;
      }
      toast.success(proje ? "Proje kaydedildi." : "Taslak proje oluşturuldu. Kapak ve fotoğrafları ekleyebilirsiniz.");
      if (proje) await yenile?.(); else router.replace(projeYolu(p.id));
    });
  }}>
    <Hata hata={is.hata} /><fieldset className="p-fieldset" disabled={is.mesgul}><div className="p-form-grid">
      <Alan ad="baslik" etiket="Başlık *" hata={is.hata}>
        <input type="text" id="baslik" name="baslik" required maxLength={120} defaultValue={proje?.baslik || ""} />
      </Alan>
      <Alan ad="kategori" etiket="Kategori *" hata={is.hata}>
        <select id="kategori" name="kategori" required defaultValue={proje?.kategori || ""}>
          <option value="" disabled>Kategori seçin</option>
          {KATEGORILER.map((k) => <option key={k.kod} value={k.kod}>{k.ad}</option>)}
        </select></Alan>
      <div className="p-full"><Alan ad="ozet" etiket="Özet *" hata={is.hata}>
        <textarea id="ozet" name="ozet" rows={3} required maxLength={300} defaultValue={proje?.ozet || ""} />
      </Alan></div>
      <Alan ad="musteri" etiket="Müşteri" hata={is.hata}>
        <input type="text" id="musteri" name="musteri" maxLength={120} defaultValue={proje?.musteri || ""} />
      </Alan>
      <Alan ad="yil" etiket="Yıl" hata={is.hata}>
        <input type="number" id="yil" name="yil" min={1990} max={2100} defaultValue={proje?.yil || ""} />
      </Alan>
      <div className="p-full"><Alan ad="videoAdresi" etiket="Video bağlantısı" hata={is.hata}
        yardim="YouTube’da Paylaş → bağlantıyı kopyala. Vimeo bağlantısı da olur. Boş bırakırsanız video kaldırılır.">
        <input type="url" id="videoAdresi" name="videoAdresi" maxLength={300} defaultValue={proje?.videoAdresi || ""} />
      </Alan></div>
      <div className="p-full"><Alan ad="aciklama" etiket="Açıklama" hata={is.hata} yardim="Paragrafları boş satırla ayırın.">
        <textarea id="aciklama" name="aciklama" rows={5} maxLength={10000} defaultValue={proje?.aciklama || ""} />
      </Alan></div>
      <div className="p-full"><Alan ad="slug" etiket="Adres (slug)" hata={is.hata}
        yardim="Boşsa başlıktan üretilir. Küçük harf, rakam ve tire kullanın.">
        <input type="text" id="slug" name="slug" maxLength={100} defaultValue={proje?.slug || ""} autoCapitalize="none" />
      </Alan></div>
      <label className="p-check"><input type="checkbox" name="oneCikan" checked={oneCikan}
        onChange={(e) => setOneCikan(e.target.checked)} />Öne çıkan proje</label>
      {proje ? <label className="p-check"><input type="checkbox" name="yayinda" checked={yayinda}
        onChange={(e) => setYayinda(e.target.checked)} />Yayında</label> :
        <p className="p-help">Yeni proje taslak açılır; görsellerini ekledikten sonra yayına alabilirsiniz.</p>}
    </div></fieldset>
    <div className="p-form-actions"><button type="submit" className="p-btn p-primary" disabled={!hazir || is.mesgul}>
      <Save size={18} />{is.mesgul ? "Kaydediliyor…" : proje ? "Projeyi kaydet" : "Taslak oluştur"}</button>
      <Link className="p-btn" href={panelYolu("Projeler")}>Proje listesi</Link>
    </div>
  </form>;
}

export function ProjectEditor({ id }: { id?: number }) {
  return id ? <MevcutProje id={id} /> : <><Baslik baslik="Yeni proje" aciklama="Başlık ve video bağlantısıyla başlayın." />
    <ProjeFormu proje={null} /></>;
}

function MevcutProje({ id }: { id: number }) {
  const { veri: p, hata, bekliyor, yenile } = useVeri<Proje>(`/projeler/${id}`);
  const router = useRouter();
  // Medya yüklemek, henüz kaydedilmemiş metin alanlarını sıfırlamamalı.
  const formKey = p && JSON.stringify([p.id, p.baslik, p.kategori, p.slug, p.ozet, p.musteri,
    p.yil, p.aciklama, p.videoAdresi, p.oneCikan, p.yayinda]);
  return <><Hata hata={hata} />{bekliyor && !p ? <Yukleniyor /> : p && <>
    <Baslik baslik="Proje düzenle" aciklama={p.baslik}>
      <div className="p-actions"><Durum kod={p.yayinda ? "YAYINDA" : "TASLAK"} metin={p.yayinda ? "Yayında" : "Taslak"} />
        {p.yayinda && <a className="p-btn" href={p.adres} target="_blank" rel="noopener"><ExternalLink size={18} />Sitede gör</a>}
      </div></Baslik>
    <ProjeFormu key={formKey} proje={p} yenile={yenile} />
    <section className="p-card p-cover"><h2>Kapak</h2>
      {!p.kapak && p.video?.kucukResim && <p className="p-help">YouTube küçük resmi kullanılıyor.</p>}
      <MediaUpload yol={`/projeler/${id}/kapak`} medya={p.kapak} etiket="Kapak" yenile={yenile} />
    </section>
    <Photos proje={id} />
    <section className="p-card p-cover"><h2>Projeyi sil</h2><p className="p-help">Proje ve bağlı fotoğrafları kalıcı olarak kaldırılır.</p>
      <Sil yol={`/projeler/${id}`} ad={p.baslik} aciklama="Fotoğraflarıyla birlikte silinir, geri alınamaz."
        sonra={async () => { router.replace(panelYolu("Projeler")); }} />
    </section>
  </>}</>;
}
