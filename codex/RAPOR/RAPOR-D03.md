# RAPOR D03 — giriş animasyonunun çapraz denetimi (Claude yazdı, Codex denetledi)

**Not:** Codex bu görevi **kullanım sınırına takılarak yarıda bıraktı** (log: `codex-d03.log`, "usage limit",
sınır 11.10.2026 01:54'te açılıyor) ve raporu yazamadı. Bu raporu Claude, Codex'in kod değişikliklerini ve
betiklerini **çalıştırarak** doğruladıktan sonra yazdı (rehber §7.21/126).

## Codex'in bulup düzelttikleri (kodda duruyor)
1. Oturum betiği `<body>` içindeydi → kök layout `<head>`'ine taşındı (`GirisBaslangici.tsx`, `girisDurumu.ts`);
   ana sayfa dışındaki sayfalar `gecildi` işareti alır, oturum bayrağını tüketmez.
2. Betikte `try/catch` her şeyi sarıyordu: depolama hatası hareket azaltma / veri tasarrufu kontrolünü de atlatıyordu →
   tercih kontrolleri depolamadan önce, ayrı.
3. JS kapalıyken `<noscript>` ayrıca `html{overflow:visible}` veriyor (kilit kalmasın).
4. `codex/e2e-giris.mjs` güçlendirildi (gerçek `/`, erişilebilirlik, odak, `/projeler` doğrudan), film dalı betiği
   `codex/d03-film-denetim.mjs` yazıldı.

## Claude'un doğrulaması (2026-10-10)
- `npx tsc --noEmit` temiz · `npm run lint` temiz · `[ÃÄÅ]`, `type`'sız düğme, giris'te renk kodu, >140 satır: boş.
- `npm test` → **90 geçti, 0 kaldı**.
- `node codex/e2e-giris.mjs` → "Giriş ana sayfa denetimi: geçti (1440 + 390)", pageerror + console.error = [].
- `node codex/e2e-vitrin.mjs` → TÜM VİTRİN SENARYOLARI GEÇTİ (perdeyle).
- `node codex/e2e-panel.mjs` → TÜM PANEL SENARYOLARI GEÇTİ.
- `node codex/d03-film-denetim.mjs` → film yüklendi (POST 201), 1440/390 oynadı ve bitince kapandı; bozuk dosya 1,1 sn,
  donma 6,1 sn, metadata yok 13,1 sn'de kapandı; reduced-motion / saveData'da film isteği 0; panelden silindi (DELETE 200, dosya 404).
- Panel sol menüsü "yarıda bitiyor" bulgusu **yanlış alarmdı** (Claude'un): tam sayfa ekran görüntüsü sticky menüyü kesik
  gösteriyor; kaydırılmış gerçek ekranda menü 900 px tam yükseklikte (`.p-sidebar` zaten `sticky; height: 100svh`).

## Yapılamayanlar
- Kayıt videoları (`giris-1440.webm`, `giris-390.webm`) Codex sınıra takıldığı için üretilmedi.
