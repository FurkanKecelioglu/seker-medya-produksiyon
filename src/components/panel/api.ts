import { GIRIS } from "./menu";

let yonlendiriliyor = false;

export class ApiHatasi extends Error {
  constructor(message: string, public alan?: string, public durum = 0, public tekrarSn = 0) {
    super(message);
  }
}

export async function api<T>(yol: string, method = "GET", veri?: unknown, oturumKontrolu = true): Promise<T> {
  let response: Response;
  try {
    const form = veri instanceof FormData;
    response = await fetch(`/api/panel${yol}`, {
      method, credentials: "same-origin", cache: "no-store",
      headers: veri !== undefined && !form ? { "Content-Type": "application/json" } : undefined,
      body: veri === undefined ? undefined : form ? veri : JSON.stringify(veri),
    });
  } catch {
    throw new ApiHatasi("Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.");
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && oturumKontrolu && !yonlendiriliyor) {
      // Eşzamanlı istekler aynı çerezi kaybedebilir; sayfa yalnız bir kez taşınır.
      yonlendiriliyor = true;
      window.location.replace(GIRIS);
    }
    throw new ApiHatasi(body?.hata || "İşlem tamamlanamadı. Tekrar deneyin.", body?.alan, response.status, body?.tekrarSn);
  }
  if (!body) throw new ApiHatasi("Sunucudan beklenen cevap alınamadı. Sayfayı yenileyin.");
  return body as T;
}
