// Telefon numarası normalleştirme — TEK fonksiyon, hem kaydederken hem ararken.
// Yalnız birinde yapılırsa ya ikiz kayıt ya bulunamayan kayıt üretir: kullanıcı
// "0542 834 11 84", "+90 542..." ya da "542..." yazabilir (rehber §7.7/41).

/** Türkiye cep numarasını 05XXXXXXXXX biçimine getirir; geçersizse null. */
export function telefonNormallestir(girdi: string): string | null {
  let r = girdi.replace(/\D/g, "");
  if (r.startsWith("90") && r.length === 12) r = r.slice(2);
  if (r.length === 10 && r.startsWith("5")) r = "0" + r;
  return /^05\d{9}$/.test(r) ? r : null;
}

/** 05XXXXXXXXX → "0542 834 11 84" (ekranda okunur biçim) */
export function telefonGoster(t: string): string {
  return /^05\d{9}$/.test(t) ? `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7, 9)} ${t.slice(9)}` : t;
}

/** 05XXXXXXXXX → 905XXXXXXXXX (wa.me ve tel: bağlantıları için) */
export function telefonUluslararasi(t: string): string {
  return "9" + t;
}
