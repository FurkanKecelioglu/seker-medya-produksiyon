"use client";

import { useState } from "react";
import { useHydrated, useVeri } from "./hooks";
import { Alan, Baslik, Bos, Hata, Sayfalama, Yukleniyor } from "./ui";
import type { Sayfali } from "./types";

type Kayit = { id: number; tarihMetni: string; kim: string; eylem: string; detay: string; ip: string | null };

export function Logs() {
  const hazir = useHydrated();
  const [sayfa, setSayfa] = useState(1);
  const [eylem, setEylem] = useState("");
  const [girilen, setGirilen] = useState("");
  const { veri, hata, bekliyor } = useVeri<Sayfali & { kayitlar: Kayit[] }>(
    `/kayitlar?sayfa=${sayfa}&eylem=${encodeURIComponent(eylem)}`,
  );
  return <><Baslik baslik="İşlem kayıtları" aciklama="Kim, ne zaman, neyi değiştirdi?" />
    <form method="post" className="p-log-filter" onSubmit={(e) => {
      e.preventDefault(); setEylem(girilen.trim().toUpperCase()); setSayfa(1);
    }}><Alan ad="eylem" etiket="Eylem süzgeci" yardim="Örn. PROJE_EKLE; tümü için boş bırakın.">
        <input type="text" id="eylem" name="eylem" list="eylemler" value={girilen} maxLength={40}
          onChange={(e) => setGirilen(e.target.value)} />
        <datalist id="eylemler">{Array.from(new Set(veri?.kayitlar.map((k) => k.eylem))).map((e) =>
          <option key={e} value={e} />)}</datalist>
      </Alan><button type="submit" className="p-btn" disabled={!hazir || bekliyor}>Süz</button>
    </form><Hata hata={hata} />{bekliyor ? <Yukleniyor /> : veri && <>
      <Sayfalama veri={veri} isim="kayıt" degistir={setSayfa} mesgul={bekliyor} />
      {veri.kayitlar.length ? <table className="p-log-table"><thead><tr>
        <th>Tarih / saat</th><th>Kullanıcı</th><th>Eylem</th><th>Detay</th>
      </tr></thead><tbody>{veri.kayitlar.map((k) => <tr key={k.id} data-kayit-id={k.id}>
        <td data-label="Tarih / saat">{k.tarihMetni}</td><td data-label="Kullanıcı">{k.kim}</td>
        <td data-label="Eylem">{k.eylem}</td><td data-label="Detay">{k.detay}</td>
      </tr>)}</tbody></table> : <Bos metin="Bu süzgeçte işlem kaydı bulunamadı." />}
      <Sayfalama veri={veri} isim="kayıt" degistir={setSayfa} mesgul={bekliyor} />
    </>}</>;
}
