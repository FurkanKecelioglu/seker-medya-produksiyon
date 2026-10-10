// Denetim izi. Log yazımı asıl işlemi geri almaz (hata fırlatmaz) ama sessiz de
// kalmaz: yazılamazsa sunucu günlüğüne basar. `.catch(() => {})` ile yutulan log
// günlerce yazılmadı ve fark edilmedi (rehber §3.4).
import { prisma } from "@/lib/prisma";

export async function log(yoneticiId: number | null, eylem: string, detay: string, ip?: string | null) {
  try {
    await prisma.islemKaydi.create({ data: { yoneticiId, eylem, detay, ip: ip ?? null } });
  } catch (e) {
    console.error("[log] yazılamadı:", eylem, detay, e);
  }
}

/** Düzenleme özetleri: "eski → yeni". "Güncellendi" yazan log işe yaramaz. */
export function degisim(alan: string, eski: unknown, yeni: unknown): string | null {
  const e = eski ?? "—";
  const y = yeni ?? "—";
  return String(e) === String(y) ? null : `${alan}: ${kisalt(e)} → ${kisalt(y)}`;
}

export function degisimOzeti(parcalar: (string | null)[]): string {
  return parcalar.filter(Boolean).join("; ") || "değişiklik yok";
}

/** Uzun metin alanları (açıklama, hakkımızda) logu okunmaz hâle getirmesin */
function kisalt(d: unknown): string {
  const s = String(d).replace(/\s+/g, " ");
  return s.length > 80 ? `${s.slice(0, 77)}…` : s;
}
