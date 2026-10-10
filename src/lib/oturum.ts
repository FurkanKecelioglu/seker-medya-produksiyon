// Panel oturumu: imzalı (HS256) httpOnly çerez.
// Çerezde yalnız yönetici kimliği ve oturum numarası var; yetki (aktif mi)
// her istekte VERİTABANINDAN okunur (guard.ts) — token bayat olabilir (rehber §3.1).
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const OTURUM_CEREZI = "seker_oturum";
const SURE_GUN = 30;

export function sirAnahtari(): Uint8Array {
  const s = process.env.OTURUM_SIRRI;
  // Güvensiz varsayılan anahtara düşmek yerine dur: boş sırla imzalanan
  // çerezi herkes üretebilir.
  if (!s || s.length < 32) throw new Error("OTURUM_SIRRI tanımlı değil ya da 32 karakterden kısa");
  return new TextEncoder().encode(s);
}

/** Yerelde http üzerinden çalışırken secure çerez hiç kaydedilmez ve her istek
 * 401 olur (rehber §8.1/2). Karar NODE_ENV'e değil sitenin adresine bağlı. */
function guvenliCerez(): boolean {
  return (process.env.SITE_URL || "").startsWith("https://");
}

export async function oturumAc(yoneticiId: number, oturumNo: number) {
  const token = await new SignJWT({ n: oturumNo })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(yoneticiId))
    .setIssuedAt()
    .setExpirationTime(`${SURE_GUN}d`)
    .sign(sirAnahtari());
  (await cookies()).set(OTURUM_CEREZI, token, {
    httpOnly: true,
    secure: guvenliCerez(),
    sameSite: "lax",
    path: "/",
    maxAge: SURE_GUN * 24 * 60 * 60,
  });
}

export async function oturumKapat() {
  (await cookies()).delete(OTURUM_CEREZI);
}

/** Çerezi doğrular; geçerliyse ham içerik, değilse null. Yetkiyi guard.ts verir. */
export async function oturumOku(): Promise<{ yoneticiId: number; oturumNo: number } | null> {
  const token = (await cookies()).get(OTURUM_CEREZI)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sirAnahtari());
    const yoneticiId = Number(payload.sub);
    if (!Number.isInteger(yoneticiId)) return null;
    return { yoneticiId, oturumNo: Number(payload.n ?? 0) };
  } catch {
    return null;
  }
}
