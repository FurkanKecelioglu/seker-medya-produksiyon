// API yardımcıları: gövde doğrulama, tek tip hata cevabı, istemci IP'si.
import { NextResponse } from "next/server";
import type { z } from "zod";

/** İş kuralı ihlali: API bunu 4xx + insanca mesaja çevirir (500 değil). */
export class KuralHatasi extends Error {
  constructor(public durum: number, mesaj: string) {
    super(mesaj);
  }
}

export function hata(durum: number, mesaj: string, ek?: Record<string, unknown>) {
  return NextResponse.json({ hata: mesaj, ...ek }, { status: durum });
}

/** JSON gövdeyi şemadan geçirir. Her POST/PATCH bu yoldan (rehber §3.7). */
export async function govdeAyristir<T extends z.ZodType>(
  req: Request,
  sema: T,
): Promise<{ veri: z.infer<T>; hata?: undefined } | { veri?: undefined; hata: NextResponse }> {
  let ham: unknown;
  try {
    ham = await req.json();
  } catch {
    return { hata: hata(400, "Geçersiz istek gövdesi") };
  }
  const s = sema.safeParse(ham);
  if (!s.success) {
    const ilk = s.error.issues[0];
    return { hata: hata(400, ilk?.message || "Geçersiz veri", { alan: ilk?.path.join(".") }) };
  }
  return { veri: s.data };
}

/**
 * İstemci IP'si (hız sınırı ve günlük için).
 * X-Forwarded-For'un İLK elemanı istemcinin kendi yazdığı değerdir — ona güvenilirse
 * saldırgan her istekte başka IP uydurup hız sınırını atlar. Canlıda Caddy
 * `header_up X-Real-IP {remote_host}` ile bu başlığın ÜZERİNE YAZAR; önce o okunur.
 * Yoksa zincirin SON elemanı (bize en yakın vekilin gördüğü adres) alınır.
 * Uygulama yalnız 127.0.0.1'i dinler, Caddy'yi atlayıp başlık uydurmak mümkün değil.
 */
export function istemciIp(req: Request): string {
  const gercek = req.headers.get("x-real-ip")?.trim();
  if (gercek) return gercek;
  const zincir = req.headers.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean);
  return zincir?.at(-1) || "yerel";
}

/** Uç gövdesini sarar: kural hatası → 4xx, benzersiz kısıt → 409 insanca mesaj
 * (çift tıklamada 500 dönmesin — rehber §4.3). Diğer hatalar yukarı fırlar. */
export async function yakala(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof KuralHatasi) return hata(e.durum, e.message);
    if ((e as { code?: string })?.code === "P2002") return hata(409, "Bu kayıt zaten var");
    throw e;
  }
}

/** Yol parametresindeki sayısal kimlik; geçersizse 404 fırlatır. */
export function kimlikAyristir(ham: string): number {
  const n = Number(ham);
  if (!Number.isInteger(n) || n <= 0) throw new KuralHatasi(404, "Kayıt bulunamadı");
  return n;
}
