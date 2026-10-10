// YouTube / Vimeo bağlantısı → (sağlayıcı, video kimliği) ve geri: gömme adresi,
// izleme adresi, küçük resim.
//
// Panelde kullanıcı tarayıcıdan kopyaladığı adresi yapıştırır; adresin kendisi
// SAKLANMAZ, yalnız kimlik saklanır ve gömme adresi buradan üretilir. Ham adres
// iframe'e konsaydı yapıştırılan her site sayfaya gömülebilirdi.
//
// YouTube gömmesi youtube-nocookie.com üzerinden: ziyaretçi oynat'a basmadan
// çerez bırakmaz (KVKK açısından da daha temiz). Sayfa açılışında oynatıcı
// YÜKLENMEZ; tasarım önce kapak gösterir, tıklanınca iframe'i koyar — 6 oynatıcı
// birden yüklenince ana sayfa megabaytlarca JavaScript indiriyordu.

export type VideoSaglayici = "youtube" | "vimeo";
export type VideoKimligi = { saglayici: VideoSaglayici; kimlik: string };

const YT_KIMLIK = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_KIMLIK = /^\d{6,12}$/;

/** Bilinen biçimlerden birinde değilse null (çağıran 400'e çevirir). */
export function videoAdresiCoz(girdi: string): VideoKimligi | null {
  let u: URL;
  try {
    u = new URL(girdi.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.replace(/^(www\.|m\.)/, "");
  const parca = u.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") return yt(parca[0]);
  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "music.youtube.com") {
    if (parca[0] === "watch") return yt(u.searchParams.get("v"));
    if (["embed", "shorts", "live", "v"].includes(parca[0])) return yt(parca[1]);
    return null;
  }
  if (host === "vimeo.com") {
    // vimeo.com/123456789 ya da vimeo.com/kanal/.../123456789
    const sayi = [...parca].reverse().find((p) => VIMEO_KIMLIK.test(p));
    return sayi ? { saglayici: "vimeo", kimlik: sayi } : null;
  }
  if (host === "player.vimeo.com" && parca[0] === "video" && VIMEO_KIMLIK.test(parca[1] ?? "")) {
    return { saglayici: "vimeo", kimlik: parca[1] };
  }
  return null;
}

function yt(k: string | null | undefined): VideoKimligi | null {
  return k && YT_KIMLIK.test(k) ? { saglayici: "youtube", kimlik: k } : null;
}

/** Kayıttan okunan değerler doğrulanmış sayılmaz: veritabanına elle yazılmış
 * bozuk bir kimlik iframe adresine girmesin. */
function gecerli(v: { saglayici: string | null; kimlik: string | null }): VideoKimligi | null {
  if (v.saglayici === "youtube" && v.kimlik && YT_KIMLIK.test(v.kimlik)) return { saglayici: "youtube", kimlik: v.kimlik };
  if (v.saglayici === "vimeo" && v.kimlik && VIMEO_KIMLIK.test(v.kimlik)) return { saglayici: "vimeo", kimlik: v.kimlik };
  return null;
}

export type VideoBilgisi = {
  saglayici: VideoSaglayici;
  kimlik: string;
  /** iframe src — otomatik oynatma açık (yalnız kullanıcı tıkladıktan sonra konmalı) */
  gommeAdresi: string;
  /** "YouTube'da izle" bağlantısı */
  izlemeAdresi: string;
  /** Kapak yoksa kullanılacak küçük resim (yalnız YouTube; Vimeo için null) */
  kucukResim: string | null;
};

export function videoBilgisi(saglayici: string | null, kimlik: string | null): VideoBilgisi | null {
  const v = gecerli({ saglayici, kimlik });
  if (!v) return null;
  if (v.saglayici === "youtube") {
    return {
      ...v,
      gommeAdresi: `https://www.youtube-nocookie.com/embed/${v.kimlik}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
      izlemeAdresi: `https://www.youtube.com/watch?v=${v.kimlik}`,
      kucukResim: `https://i.ytimg.com/vi/${v.kimlik}/hqdefault.jpg`,
    };
  }
  return {
    ...v,
    gommeAdresi: `https://player.vimeo.com/video/${v.kimlik}?autoplay=1&dnt=1`,
    izlemeAdresi: `https://vimeo.com/${v.kimlik}`,
    kucukResim: null,
  };
}
