<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Şeker Medya Prodüksiyon web sitesi — proje kuralları

- Önce oku: `C:\Users\HP\.claude\PROJE-TECRUBELERI.md` (özellikle §7), `PLAN.md`, `notlar/kararlar/`, `notlar/API.md`.
- Kaynak: `C:\Users\HP\Desktop\seker_medya_prodüksiyon_web_sitesi_raporu.pdf` (müşteri raporu).
- Dil Türkçe (site tek dil); kod yorumları "neden"i anlatır.
- İş bölümü (karar 0005): arka uç (`prisma/`, `src/lib/`, `src/app/api/`, `src/app/yuklemeler/`, `tools/`, `tests/`) Claude'da;
  ekranlar/tasarım (`src/app/(site)/`, `src/app/panel/`, `src/components/`, `globals.css`, `layout.tsx`'in görünüm kısmı) Codex'te.
  Codex `src/lib/`, API ve şemayı DEĞİŞTİRMEZ; ihtiyacını raporuna yazar.
- Dev: `npm run dev` → http://localhost:3060. Veritabanı: Laragon MySQL 8, `produksiyon` veritabanı.
  Aynı MySQL'de başka projelerin veritabanları var — onlara dokunulmaz.
- Yüklemeler yerelde `C:\Users\HP\Desktop\produksiyon-yuklemeler` (uygulama dizini DIŞINDA).
- Saat: her şey İstanbul saati, `src/lib/tarih.ts` üzerinden. `toISOString().slice(0,10)` yasak.
- Her düğmede `type` açıkça yazılır. Her `<form>` `method="post"` taşır. Türkçe içerikli işten sonra `rg -n "[ÃÄÅ]" src` boş olmalı.
- Sitedeki hiçbir metin/iletişim bilgisi koda gömülmez: `vitrinVerisi()` (src/lib/vitrin.ts) üzerinden gelir.
- Şema değişikliği: `prisma/schema.prisma` + yeni klasör `prisma/migrations/<tarih>_<ad>/migration.sql`
  (`npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`). Canlıda `prisma migrate deploy`.
- Test: dev açıkken `npm test` (tests/test-api.mjs). Kesin doğrulama üretim derlemesinde.
  Dev çalışırken `npm run build` YAPMA — aynı `.next`'e yazar, dev'i bozar.
- Git push yok; commit yalnız istenirse.
- Teslim: proje dosya olarak Yusuf'a verilecek, sunucuyu o kiralayıp canlıya alacak (karar 0001).
  Kurulum belgesi kendi başına yeterli olmalı — bizim makinemize, Laragon'a, berber sunucusuna bağımlılık yok.
