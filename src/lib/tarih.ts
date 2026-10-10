// Tarih/saat yardımcıları — sitenin saati her zaman İstanbul saatidir.
//
// Sunucu (VDS/kapsayıcı) UTC çalışabilir, geliştirme makinesi TR çalışır; makine
// saatine bağlı kod iki ortamda farklı sonuç verir (rehber §7.16/81). Bu yüzden
// burada hiçbir hesap makinenin yerel saatine dayanmaz: Türkiye 2016'dan beri
// yaz/kış saati uygulamıyor, sabit UTC+03:00. Gün ve saat metinleri bu ofsetle
// kurulur, gösterim Intl ile "Europe/Istanbul" üzerinden yapılır.
//
// `toISOString().slice(0,10)` YASAK: TR gece yarısı UTC'de önceki gündür (rehber §3.5).

export const SAAT_DILIMI = "Europe/Istanbul";
const OFSET = "+03:00";
const OFSET_MS = 3 * 60 * 60 * 1000;

/** "YYYY-MM-DD" biçimini ve takvim geçerliliğini denetler (2026-02-30 reddedilir). */
export function gunGecerliMi(gun: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(gun)) return false;
  const [y, a, g] = gun.split("-").map(Number);
  const d = new Date(Date.UTC(y, a - 1, g));
  return d.getUTCFullYear() === y && d.getUTCMonth() === a - 1 && d.getUTCDate() === g;
}

/** "HH:MM" → gece yarısından dakika. Geçersizse null. */
export function saatDakika(saat: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(saat);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** Dakika → "HH:MM" */
export function dakikaSaat(dk: number): string {
  return `${String(Math.floor(dk / 60)).padStart(2, "0")}:${String(dk % 60).padStart(2, "0")}`;
}

/** İstanbul'daki gün + dakika → mutlak an */
export function anKur(gun: string, dk: number): Date {
  return new Date(new Date(`${gun}T00:00:00${OFSET}`).getTime() + dk * 60_000);
}

/** Bir anın İstanbul'daki günü ("YYYY-MM-DD") */
export function istanbulGunu(an: Date): string {
  const d = new Date(an.getTime() + OFSET_MS);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** Bir anın İstanbul'daki gece yarısından dakikası */
export function istanbulDakika(an: Date): number {
  const d = new Date(an.getTime() + OFSET_MS);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/** Bir anın İstanbul'daki saati "HH:MM" */
export function istanbulSaat(an: Date): string {
  return dakikaSaat(istanbulDakika(an));
}

/** Günün haftadaki sırası: 0 = Pazar … 6 = Cumartesi */
export function haftaGunu(gun: string): number {
  const [y, a, g] = gun.split("-").map(Number);
  return new Date(Date.UTC(y, a - 1, g)).getUTCDay();
}

/** Güne n gün ekler */
export function gunEkle(gun: string, n: number): string {
  const [y, a, g] = gun.split("-").map(Number);
  const d = new Date(Date.UTC(y, a - 1, g + n));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** İstanbul'da bugünün tarihi */
export function bugun(): string {
  return istanbulGunu(new Date());
}

/** Gün sınırları: [günBaşı, ertesi günBaşı) */
export function gunAraligi(gun: string): { bas: Date; son: Date } {
  return { bas: anKur(gun, 0), son: anKur(gunEkle(gun, 1), 0) };
}

/** "1 Ekim 2026 Perşembe" */
export function uzunTarih(an: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: SAAT_DILIMI, day: "numeric", month: "long", year: "numeric", weekday: "long",
  }).format(an);
}

/** "1 Ekim Perşembe 14:30" — WhatsApp mesajları ve listeler için */
export function tarihSaat(an: Date): string {
  const t = new Intl.DateTimeFormat("tr-TR", {
    timeZone: SAAT_DILIMI, day: "numeric", month: "long", weekday: "long",
  }).format(an);
  return `${t} ${istanbulSaat(an)}`;
}
