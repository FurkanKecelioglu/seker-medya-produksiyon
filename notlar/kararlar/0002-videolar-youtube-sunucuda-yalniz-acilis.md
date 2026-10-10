# 0002 — Videolar YouTube/Vimeo'da; sunucuda yalnız açılış videosu

**Tarih:** 2026-10-09 · **Durum:** öneri — kullanıcıya bildirildi, itiraz gelmedi

Rapor "video odaklı" bir site istiyor (tam ekran açılış videosu, showreel, proje videoları).

- **Açılış videosu** sunucuda durur: kısa (10-20 sn), sessiz, döngü, sıkıştırılmış MP4/WebM,
  en çok 25 MB. Sunucuda kodlama (ffmpeg) yok; yüklenen dosya olduğu gibi saklanır, biçim
  dosyanın ilk baytlarından doğrulanır. Ayrıca bir **poster** görseli zorunlu tutulur.
  Mobilde ve "veri tasarrufu" açıkken video yerine poster gösterilir (tasarım görevi).
- **Showreel ve proje videoları** YouTube ya da Vimeo'da durur. Kayıtta yalnız sağlayıcı +
  video kimliği tutulur (ham bağlantı değil — başka siteyi gömme yolu kapalı). Gömme
  `youtube-nocookie.com` üzerinden; sayfa açılışında oynatıcı YÜKLENMEZ, önce kapak görünür,
  tıklanınca iframe konur.
- **Neden:** Videoları kendi sunucusunda barındırmak küçük bir VDS'te disk ve trafik sorunudur;
  YouTube aynı videoyu her cihaza uygun çözünürlükte, ücretsiz verir. Altı oynatıcıyı birden
  yükleyen ana sayfa megabaytlarca JavaScript indirir — "performans testleri" maddesi (rapor §8)
  bunu geçemez.
- Range isteği desteklenir (`/yuklemeler/[dosya]`): iPhone Safari 206 alamazsa videoyu oynatmaz.

## Ek (2026-10-10) — giriş animasyonu

Kullanıcı açılışa yapay zekâyla üretilmiş bir **giriş animasyonu** istedi (sahne: kamera vizöründen
açılış — REC noktası, odak, sete açılış, logo). Bu da sunucuda duran kısa bir video:
`giris_videosu` (masaüstü 16:9) + `giris_videosu_mobil` (9:16), panelden yüklenir, aynı 25 MB ve
ilk bayt kuralı. İkisi de boşsa animasyon yok. Oturumda bir kez oynar, "Geç" düğmesi ilk kareden
görünür, `prefers-reduced-motion` / `saveData` açıkken hiç yüklenmez (gazoz `HeroIntro` deseni).
Koda (`public/`) gömülmedi: firma videoyu değiştirmek için yazılımcı çağırmasın (karar 0003).
