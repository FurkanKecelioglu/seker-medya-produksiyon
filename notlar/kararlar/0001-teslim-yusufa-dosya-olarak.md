# 0001 — Teslim: proje dosya olarak Yusuf'a, canlıya o alır

**Tarih:** 2026-10-09 · **Durum:** kapandı (kullanıcı söyledi)

- Site Şeker Medya Prodüksiyon için. Satışı ve canlıya almayı **Yusuf** yapacak;
  biz projeyi dosya olarak teslim ediyoruz. Sunucu ayrıca kiralanacak — berberin
  VDS'iyle ilgisi yok.
- Sonuçları:
  - Kurulum belgesi (`dagitim/KURULUM.md`) **kendi başına yeterli** olmalı: bizim makinemize,
    Laragon'a ya da berber sunucusuna hiçbir atıf/bağımlılık olmayacak.
  - Hiçbir sır dosyalarda gitmez: `.env` teslim paketine girmez, `.env.example` gider.
    Oturum sırrı ve panel şifresi sunucuda üretilir (`tools/yonetici-ac.ts`).
  - Şema değişiklikleri **migration** dosyası olarak tutulur (`prisma/migrations/`), canlıda
    `prisma migrate deploy` ile kurulur. `db push` yalnız yerelde.
  - Rehberin sunucu bölümündeki dersler (§10, §7.1, §7.4, §7.5) kurulum belgesine
    adım adım ve KANIT komutlarıyla yazılır — Yusuf bu tuzakları bilmiyor.
- Teslim paketi: kaynak kod (node_modules, .next, .env, yüklemeler hariç) + KURULUM.md + örnek
  Caddyfile/systemd/yedek betiği. Hazırlanınca ZIP'in içeriği listelenip kontrol edilir.
- Dil: yalnız Türkçe (çok dilli altyapı kurulmadı).
