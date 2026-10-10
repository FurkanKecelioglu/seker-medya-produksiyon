// Bellek içi kayan pencere hız sınırı. Tek süreçli VDS için yeterli; uygulama
// yeniden başlarsa sayaçlar sıfırlanır (kabul edilebilir).
const kovalar = new Map<string, number[]>();

/** İzin verildiyse null, aşıldıysa kaç saniye sonra tekrar denenebileceği. */
export function hizSiniri(anahtar: string, adet: number, pencereSn: number): number | null {
  const simdi = Date.now();
  const sinir = simdi - pencereSn * 1000;
  const liste = (kovalar.get(anahtar) ?? []).filter((t) => t > sinir);
  if (liste.length >= adet) {
    kovalar.set(anahtar, liste);
    return Math.ceil((liste[0] + pencereSn * 1000 - simdi) / 1000);
  }
  liste.push(simdi);
  kovalar.set(anahtar, liste);
  // Harita sınırsız büyümesin
  if (kovalar.size > 5000) {
    for (const [k, v] of kovalar) if (!v.some((t) => t > sinir)) kovalar.delete(k);
  }
  return null;
}

/** Başarılı girişten sonra sayaç temizlenir. */
export function hizSiniriSifirla(anahtar: string) {
  kovalar.delete(anahtar);
}
