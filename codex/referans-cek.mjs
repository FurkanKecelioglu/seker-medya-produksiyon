import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chrome" });
for (const [w, h, ad] of [[1440, 900, "masaustu"], [390, 844, "mobil"]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto("https://www.monsterandbear.com.au", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(3000);
  await p.screenshot({ path: `codex/referans/monsterandbear-${ad}-ilk-ekran.png` });
  // tam sayfa: kaydırarak tembel yüklenenleri tetikle
  for (let y = 0; y < 12000; y += 800) { await p.mouse.wheel(0, 800); await p.waitForTimeout(150); }
  await p.screenshot({ path: `codex/referans/monsterandbear-${ad}-tam.png`, fullPage: true });
  await p.close();
}
await b.close();
