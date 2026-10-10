export const GIRIS_BAYRAGI = "sm:giris-goruldu";

// Tasarruf/hareket tercihi depolamadan bağımsızdır: storage hatası bu kontrolleri atlatmamalı.
export function girisDurumu() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (c?.saveData || matchMedia("(prefers-reduced-motion: reduce)").matches) return "gecildi";
  try {
    if (sessionStorage.getItem(GIRIS_BAYRAGI)) return "gecildi";
    sessionStorage.setItem(GIRIS_BAYRAGI, "1");
  } catch { /* Depolama engelliyse animasyon yine çalışır; tercih kontrolleri yukarıda yapıldı. */ }
  return "oynuyor";
}

// Head'deki yerel betik React yüklenmeden çalışır; diğer sayfalar oturum bayrağını tüketmez.
export const BAYRAK_BETIGI = `(function(){var d=document.documentElement,c=navigator.connection;
if(location.pathname!=="/"){d.dataset.giris="gecildi";return;}
var gec=(c&&c.saveData)||matchMedia("(prefers-reduced-motion: reduce)").matches;
try{gec=gec||!!sessionStorage.getItem(${JSON.stringify(GIRIS_BAYRAGI)});
if(!gec)sessionStorage.setItem(${JSON.stringify(GIRIS_BAYRAGI)},"1");}catch(e){}
d.dataset.giris=gec?"gecildi":"oynuyor";})();`;
