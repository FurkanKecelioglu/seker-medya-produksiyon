// Claude'un bağımsız panel denetimi (Codex'in betiğinden ayrı, kendi seçicileriyle)
import "dotenv/config";
import { chromium } from "playwright-core";
const U = "http://localhost:3060";
const b = await chromium.launch({ channel: "chrome" });
const hata = [];
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
const p = await ctx.newPage();
p.on("pageerror", e => hata.push(String(e)));
p.on("console", m => { if (m.type() === "error") hata.push(m.text().slice(0, 200)); });
await p.goto(U + "/panel", { waitUntil: "networkidle" });
console.log("oturumsuz /panel →", new URL(p.url()).pathname);
await p.getByLabel("Kullanıcı adı").fill("yonetici");
await p.getByLabel("Şifre", { exact: true }).fill(process.env.SEED_SIFRE_YONETICI);
const [gr] = await Promise.all([p.waitForResponse(r => r.url().endsWith("/api/panel/giris")), p.getByRole("button", { name: /Giriş/ }).click()]);
await p.waitForURL(/\/panel\/teklifler/);
console.log("giriş", gr.status(), "→", new URL(p.url()).pathname);

// Ayar: güven satırı → sitede görünür → geri al
await p.goto(U + "/panel/ayarlar", { waitUntil: "networkidle" });
const kutu = p.locator('[name="guven_satiri"]');
const eski = await kutu.inputValue();
await kutu.fill("Claude denetim satırı");
const [pr] = await Promise.all([p.waitForResponse(r => r.url().endsWith("/api/panel/ayarlar") && r.request().method() === "PATCH"),
  p.getByRole("button", { name: "Değişiklikleri kaydet" }).click()]);
console.log("ayar PATCH", pr.status(), "gövde:", pr.request().postData());
const site = await (await fetch(U + "/")).text();
console.log("sitede görünüyor:", site.includes("Claude denetim satırı"));
await kutu.fill(eski);
const [pr2] = await Promise.all([p.waitForResponse(r => r.url().endsWith("/api/panel/ayarlar") && r.request().method() === "PATCH"),
  p.getByRole("button", { name: "Değişiklikleri kaydet" }).click()]);
console.log("geri alındı", pr2.status(), "sitede kalmadı:", !(await (await fetch(U + "/")).text()).includes("Claude denetim satırı"));

// Listeler: E2E artığı var mı (API ile, oturum çereziyle)
const api = async yol => (await p.request.get(U + "/api/panel/" + yol)).json();
const pj = await api("projeler"), hz = await api("hizmetler"), mk = await api("markalar");
console.log("E2E artığı — proje:", pj.projeler.filter(x => /E2E/.test(x.baslik)).length,
  "hizmet:", hz.hizmetler.filter(x => /E2E/.test(x.baslik)).length, "marka:", mk.markalar.filter(x => /E2E/.test(x.ad)).length);
for (const yol of ["teklifler", "projeler", "galeri", "ayarlar", "hizmetler", "markalar", "kayitlar", "sifre"]) {
  await p.goto(U + "/panel/" + yol, { waitUntil: "networkidle" });
  const g = await p.evaluate(() => document.documentElement.scrollWidth);
  const ust = await p.locator(".site-header, .floating-whatsapp").count();
  console.log(`/panel/${yol}: scrollWidth=${g} site-kabuğu=${ust}`);
}
const robots = await p.locator('meta[name="robots"]').getAttribute("content");
console.log("panel robots:", robots);
console.log("hatalar:", hata);
await b.close();
