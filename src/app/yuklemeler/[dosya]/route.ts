// GET /yuklemeler/<dosya> — YUKLEME_DIZINI'ndeki fotoğraf ve videoları sunar.
// Canlıda Caddy bu yolu doğrudan diskten de verebilir (dagitim/Caddyfile); bu uç
// yine de kalır ki geliştirmede ve Caddy'siz kurulumda da çalışsın.
//
// Range desteği ŞART: Safari/iOS, video için önce "bytes=0-1" ister; 206 alamazsa
// videoyu hiç oynatmaz (açılış videosu iPhone'da siyah ekran kalırdı).
import { open, stat } from "node:fs/promises";
import path from "node:path";
import { dosyaAdiGecerliMi, ICERIK_TURU, yuklemeDizini } from "@/lib/yukleme";

function ortakBasliklar(tur: string) {
  return {
    "Content-Type": tur,
    // Dosya adı rastgele ve içerik hiç değişmez: değişen dosya yeni ad alır
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  };
}

export async function GET(req: Request, ctx: RouteContext<"/yuklemeler/[dosya]">) {
  const { dosya } = await ctx.params;
  if (!dosyaAdiGecerliMi(dosya)) return new Response("Bulunamadı", { status: 404 });
  const tam = path.join(yuklemeDizini(), dosya);
  const tur = ICERIK_TURU[dosya.split(".").pop()!.toLowerCase()];

  let boyut: number;
  try {
    boyut = (await stat(tam)).size;
  } catch {
    return new Response("Bulunamadı", { status: 404 });
  }

  const aralik = req.headers.get("range");
  let bas = 0;
  let son = boyut - 1;
  let kismi = false;
  if (aralik) {
    // Yalnız tek aralık: "bytes=bas-son", "bytes=bas-" ya da "bytes=-sondanN"
    const m = /^bytes=(\d*)-(\d*)$/.exec(aralik.trim());
    if (!m || (m[1] === "" && m[2] === "")) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${boyut}` } });
    }
    if (m[1] === "") {
      bas = Math.max(0, boyut - Number(m[2]));
    } else {
      bas = Number(m[1]);
      if (m[2] !== "") son = Math.min(Number(m[2]), boyut - 1);
    }
    if (bas > son || bas >= boyut) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${boyut}` } });
    }
    kismi = true;
  }

  const uzunluk = son - bas + 1;
  const fh = await open(tam, "r");
  try {
    const tampon = Buffer.alloc(uzunluk);
    await fh.read(tampon, 0, uzunluk, bas);
    return new Response(new Uint8Array(tampon), {
      status: kismi ? 206 : 200,
      headers: {
        ...ortakBasliklar(tur),
        "Content-Length": String(uzunluk),
        ...(kismi ? { "Content-Range": `bytes ${bas}-${son}/${boyut}` } : {}),
      },
    });
  } finally {
    await fh.close();
  }
}
