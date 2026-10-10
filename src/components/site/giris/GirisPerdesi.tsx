"use client";

// Perdenin istemci tarafı: "Geç" / ESC, akan zaman kodu, kaydırma kilidi ve (varsa) film oynatma.
// Perdenin kapanması JS'e BAĞLI DEĞİL — CSS kendiliğinden kapatır (giris.module.css). JS burada
// yalnız erken kapatır; JS düşerse ziyaretçi en kötü 4,5 sn animasyon izler, kilitli kalmaz.
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import s from "./giris.module.css";
import { girisDurumu } from "./girisDurumu";

type Video = { url: string; tur: string };

const KARE_HIZI = 25;
/** Animasyonun CSS süresiyle aynı (giris.module.css → 4.5s) */
const SURE_MS = 4500;
/** Film: metadata hiç gelmezse (bozuk dosya, engellenen istek) bu süre sonra perde kalkar */
const FILM_METADATA_SINIRI = 12000;
/** Film: oynarken bu kadar süre ilerleme olmazsa (donma) perde kalkar — gazoz dersi */
const FILM_DONMA_SINIRI = 4000;

function zamanKodu(ms: number) {
  const toplamKare = Math.floor((ms / 1000) * KARE_HIZI);
  const iki = (n: number) => String(n).padStart(2, "0");
  const sn = Math.floor(toplamKare / KARE_HIZI);
  return `00:00:${iki(sn)}:${iki(toplamKare % KARE_HIZI)}`;
}

export function GirisPerdesi({ firmaAdi, video, zemin }: {
  firmaAdi: string;
  video: { masaustu: Video; mobil: Video } | null;
  zemin: ReactNode;
}) {
  // Sunucu ve ilk istemci boyası aynı olmalı (hidrasyon): "oynuyor" mu, effect'te okunur.
  const [oynuyor, setOynuyor] = useState(false);
  const [gecildi, setGecildi] = useState(false);
  const [filmAdresi, setFilmAdresi] = useState<Video | null>(null);
  const kodRef = useRef<HTMLSpanElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const perdeRef = useRef<HTMLDivElement>(null);

  const bitir = useCallback(() => {
    setGecildi(true);
    // İşaret 0,3 sn'lik sönme BİTİNCE konur: "gecildi" perdeyi display:none yapar, hemen konursa sönme görünmez.
    // İşaretle birlikte açılış metnindeki bekleme animasyonu da düşer, metin hemen görünür.
    window.setTimeout(() => { document.documentElement.dataset.giris = "gecildi"; }, 300);
  }, []);

  useEffect(() => {
    // İlk belge yüklemesinde head'in kararı korunur; istemci gezinmesinde oturum yeniden okunur.
    // Link ile ilk kez ana sayfaya gelinirse head betiği tekrar çalışmaz; aynı kararı burada ver.
    const kok = document.documentElement;
    const durum = kok.dataset.giris === "oynuyor" ? "oynuyor" : girisDurumu();
    kok.dataset.giris = durum;
    if (durum !== "oynuyor") return;
    // Yalnız ilk okuma; effect bir kez çalışır
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOynuyor(true);
    if (video) {
      // Ekrana göre TEK video: CSS ile gizlenen ikinci <video> da iner
      setFilmAdresi(matchMedia("(max-width: 768px)").matches ? video.mobil : video.masaustu);
    }
  }, [video]);

  // Kaydırma kilidi + ESC: yalnız perde açıkken
  useEffect(() => {
    if (!oynuyor || gecildi) return;
    // Yalnız ESC: Enter/Space pencereye bağlanırsa klavye kullanıcısı farkında olmadan geçer
    const tus = (e: KeyboardEvent) => { if (e.key === "Escape") bitir(); };
    window.addEventListener("keydown", tus);
    // Kod animasyonunda kilit CSS süresi dolunca açılır; film kendi olaylarıyla biter
    // CSS geç yüklenebilir; sayfa saati değil, gerçekten başlayan perde animasyonunun saati kullanılır.
    const an = perdeRef.current?.getAnimations()[0]?.currentTime;
    const zaman = video ? null : window.setTimeout(bitir, Math.max(0, SURE_MS - Number(an ?? 0)));
    return () => {
      window.removeEventListener("keydown", tus);
      if (zaman) window.clearTimeout(zaman);
    };
  }, [oynuyor, gecildi, video, bitir]);

  // Akan zaman kodu (JS yoksa 00:00:00:00 kalır — sorun değil)
  useEffect(() => {
    if (!oynuyor || gecildi || video) return;
    let kare = 0;
    const tik = () => {
      const t = Number(perdeRef.current?.getAnimations()[0]?.currentTime ?? 0);
      if (kodRef.current) kodRef.current.textContent = zamanKodu(t);
      if (t < SURE_MS) kare = requestAnimationFrame(tik);
    };
    kare = requestAnimationFrame(tik);
    return () => cancelAnimationFrame(kare);
  }, [oynuyor, gecildi, video]);

  // Film: sessiz oynat; engellenir/bozulur/donarsa perde kalkar (sayfa asla kilitli kalmaz)
  useEffect(() => {
    const f = filmRef.current;
    if (!filmAdresi || !f || gecildi) return;
    f.muted = true;
    f.setAttribute("muted", "");
    f.play()?.catch(bitir);
    let son = { t: 0, an: Date.now() };
    const ilerle = () => { if (f.currentTime > son.t + 0.05) son = { t: f.currentTime, an: Date.now() }; };
    const metadata = window.setTimeout(() => { if (f.readyState < 1) bitir(); }, FILM_METADATA_SINIRI);
    const donma = window.setInterval(() => {
      if (f.readyState >= 1 && Date.now() - son.an > FILM_DONMA_SINIRI) bitir();
    }, 1000);
    f.addEventListener("timeupdate", ilerle);
    f.addEventListener("ended", bitir);
    f.addEventListener("error", bitir);
    return () => {
      window.clearTimeout(metadata);
      window.clearInterval(donma);
      f.removeEventListener("timeupdate", ilerle);
      f.removeEventListener("ended", bitir);
      f.removeEventListener("error", bitir);
      // Geçilen film görünmezken oynayıp veri ve işlemci tüketmesin.
      f.pause();
    };
  }, [filmAdresi, gecildi, bitir]);

  const gecIsareti = gecildi ? "" : undefined;

  return (
    <>
      <div ref={perdeRef} className={`${s.perde} ${video ? s.film : ""}`} data-giris-perde="" data-gecildi={gecIsareti}
        aria-hidden="true" inert={gecildi}>
        {video ? (
          filmAdresi && (
            <video ref={filmRef} className={s.filmVideo} muted playsInline preload="auto">
              {/* Chrome bozuk kaynak hatasını video yerine source üzerinde bildirebilir. */}
              <source src={filmAdresi.url} type={filmAdresi.tur} onError={bitir} />
            </video>
          )
        ) : (
          <>
            <div className={s.gorsel}>{zemin}</div>
            <div className={s.vizor}>
              {/* Dört L köşe: CSS kenarlığı + clip-path ile "çizilerek" gelir (SVG kesik çizgi hilesi tarayıcıya göre bozuluyordu) */}
              <span className={`${s.kose} ${s.solUst}`} /><span className={`${s.kose} ${s.sagUst}`} />
              <span className={`${s.kose} ${s.sagAlt}`} /><span className={`${s.kose} ${s.solAlt}`} />
              <div className={s.izgara} />
              <div className={s.odak}><span className={s.af}>AF</span></div>
              <div className={s.ust}>
                <span className={s.rec}><span className={s.recNokta} />REC</span>
                <span ref={kodRef} className={s.zamanKodu}>00:00:00:00</span>
              </div>
              <div className={s.alt}>
                <span className={s.klip}>{firmaAdi}</span>
                <span>4K · 25P · ISO 800</span>
              </div>
            </div>
          </>
        )}
      </div>
      <button type="button" className={s.gec} data-giris-gec="" data-gecildi={gecIsareti} onClick={bitir}
        tabIndex={gecildi ? -1 : 0}>
        Geç
      </button>
    </>
  );
}
