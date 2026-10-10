# Şeker Medya Prodüksiyon — Web Sitesi Planı

Prodüksiyon firması için video odaklı, koyu sinematik kurumsal + portföy sitesi; içeriği panelden
yönetilir. Slogan: "Hikâyenizi görüntüye, görüntünüzü etkiye dönüştürüyoruz."
Kaynak: `C:\Users\HP\Desktop\seker_medya_prodüksiyon_web_sitesi_raporu.pdf`. Teslim: dosya olarak Yusuf'a,
canlıya o alır (karar 0001). Dil: yalnız Türkçe.

Kararlar: `notlar/kararlar/` · API sözleşmesi: `notlar/API.md` · Rehber: `C:\Users\HP\.claude\PROJE-TECRUBELERI.md`

## Yığın
Next.js 16.3.8 (`--webpack`) · React 19.2 · Prisma 7.10 + `@prisma/adapter-mariadb` · MySQL 8 · Zod 4 · jose (oturum) ·
sharp (görsel) · Tailwind 4 · lucide-react · sonner. Berber projesiyle aynı sürümler.

## Fazlar

### Faz 1 — Arka uç omurgası (Claude) ✅ 2026-10-09
- [x] İskelet: Next 16 + Prisma 7 + yerel MySQL (`produksiyon` DB, `mysql_native_password` kullanıcı), git init
- [x] Şema: Yonetici, Ayar, Hizmet, Proje (+kategori enum), Foto (proje + galeri tek tablo), Marka, TeklifTalebi, IslemKaydi
- [x] İlk migration dosyası (`prisma/migrations/20261009000000_ilk`) — canlıda `migrate deploy`
- [x] `lib/`: prisma, http, guard (yetki DB'den), oturum (jose), log (eski → yeni), tarih (İstanbul), telefon, kimlik,
      hizSiniri, yukleme (sharp WebP + EXIF silme, video ilk bayt doğrulaması), video (YouTube/Vimeo kimlik ayrıştırma),
      ayarlar (metin + medya, tek liste), vitrin (taslak süzgeci tek yerde), teklif (jeton), seo, slug, kategoriler
- [x] API: teklif (jeton + gönderim), panel (giriş/çıkış/ben/şifre, ayarlar + medya, hizmet, proje + kapak, foto,
      marka + logo, sıralama, teklifler, kayıtlar), `/yuklemeler` (Range destekli), robots, sitemap
- [x] Seed: `yonetici` hesabı + rapordaki 8 hizmet · `tools/yonetici-ac.ts` (hesap aç / şifre sıfırla)
- [x] `tests/test-api.mjs` **86/86** (dev; üretim derlemesinde 87/87 — Faz 4). Sabotaj: jeton kontrolü kapatılınca 3 madde kırıldı → test gerçekten yakalıyor
- [x] Yakalanan: kullanıcı adında büyük "I" Türkçe küçültmede "ı" oluyordu (berberden gelen fonksiyon) → düzeltildi
- [x] Yakalanan: sharp HEIC açamıyor; "HEIC yükleyin" mesajı yanlıştı → mesaj + `accept` kuralı

## ▶ KALDIĞIMIZ YER (2026-10-10)
1. ✅ **Görev 01 (vitrin) bitti ve denetlendi** (2026-10-10): `codex/RAPOR/RAPOR-01.md`; e2e dev ×2 + üretim provası geçti,
   kendi tarayıcı turumda konsol hatası 0. Bulunan 3 küçük kusur (ızgarada YouTube siyah bantları, başlık üstünde firma adı
   tekrarı, açılışta üst bölüm okunurluğu) Görev 02'ye "6b. D01" olarak eklendi.
2. ✅ **Görev 02 (panel) bitti, Claude denetledi**: `RAPOR-02.md`; bağımsız turum (`codex/_claude-panel-denetim.mjs`)
   geçti. Yakalanan: `tests/test-api.mjs`'te yerel şifre koda yazılıydı → `.env`'den okunuyor, depoda şifre taraması temiz.
3. ✅ **Giriş animasyonu (Claude yazdı)** ana sayfaya bağlandı, `/giris-deneme` silindi, `codex/e2e-giris.mjs` `/` için geçti.
4. ✅ **D03 çapraz denetim** — Codex sınıra takılıp yarıda kaldı; değişikliklerini Claude çalıştırarak doğruladı
   (`codex/RAPOR/RAPOR-D03.md`): tsc/lint/90 test/giriş+vitrin+panel+film e2e hepsi geçti.
5. **SIRADA:** kullanıcı localde gözden geçirecek (http://localhost:3060, panel /panel). Geri bildirimine göre
   düzeltme turu. Açık: logo, gerçek içerik, KVKK metni, teklif bildirimi (e-posta/push), Faz 4 teslim kontrolleri.

Bugün yapılanlar (2026-10-09/10):
- Kullanıcı Monster & Bear'i (monsterandbear.com.au) referans seçti → `codex/referans/` ekran görüntüleri (`codex/referans-cek.mjs`).
- Tasarım araştırması: `notlar/arastirma-tasarim-ornekleri.md`.
- `tools/ornek-icerik.ts` (YALNIZ YEREL): Çankırı Postası YouTube'undaki 8 gerçek işle proje, video karelerinden
  bölüm görselleri + galeri, 6 uydurma marka, iletişim/metin ayarları. Yerel DB'ye yüklendi; tekrar çalıştırılınca eklemez.
- Yeni ayarlar: `konum_satiri`, `guven_satiri`, `surec_adimlari` (vitrin: `metinler.konumSatiri/guvenSatiri/surecAdimlari`).
- Test 87/87 (dev). Teslim konusu kapandı: kullanıcı GitHub'a yükleyecek, Yusuf kuracak — dağıtımla uğraşma.

### Faz 2 — Vitrin tasarımı (Codex, Görev 01) ✅ 2026-10-10
- [x] Görev metni: `codex/GOREV-01-vitrin.md` (referans: Monster & Bear; prototip ZIP gelmedi, beklenmiyor)
- [ ] Ana sayfa akışı (rapor §2): açılış videosu + slogan · kısa tanıtım · 8 hizmet kartı · showreel · öne çıkan 6 proje ·
      canlı yayın bölümü · drone bölümü · markalar · iletişim çağrısı
- [ ] Sayfalar: hakkımızda, hizmetler, projeler (kategori süzgeci), proje detay, galeri (lightbox), iletişim, teklif al
- [ ] Denetim (Claude): 390/768/1280 px, Lighthouse, mobilde video inmiyor, form gerçekten gidiyor, JS kapalı form, reduced-motion

### Faz 3 — Yönetim paneli (Codex, Görev 02) ✅ 2026-10-10
- [ ] Giriş, ayarlar (alan listesinden çizilen form + medya yükleme), hizmetler, projeler (+kapak, fotoğraflar, sıralama),
      galeri, markalar, teklif talepleri (durum, not, WhatsApp dönüşü), işlem kayıtları, şifre değiştir
- [ ] Denetim (Claude): her formda kaydet → ağ isteği → ekran güncellendi; telefonda kullanılabilir

### Faz 4 — Teslim paketi (Claude)
- [x] `dagitim/KURULUM.md` (2026-10-09) — Yusuf için, kendi başına yeterli: SSH (anahtar → dene → kapat, `sshd -T`),
      ufw/fail2ban/saat, MySQL 8 (`mysql_native_password`, yalnız 127.0.0.1), Node 22, Caddy, `.env`, ilk kurulum,
      HTTPS, yedek + geri yükleme provası, rclone, güncelleme, teslim kontrolü, sık sorunlar. Her adımda KANIT komutu.
- [x] `dagitim/Caddyfile` (www → kök, /yuklemeler doğrudan diskten + Range, X-Real-IP, 30 MB gövde sınırı),
      `seker.service`, `seker-yedek.sh` (boş yedekte hata). Tek seferlik teslim (kullanıcı: "düzenli yapılacak bir
      iş değil") → sürüm dizini/güncelleme betiği YOK; klasör `/opt/seker/app`'e kopyalanır, komutlar elle.
- Karar: `lower_case_table_names` **gerekmiyor** — veri Windows'tan taşınmıyor, tablolar Linux'ta migration ile
  doğuyor, yedek de Linux→Linux. Bu ayar yalnız ilk initialize'da verilebildiği için Yusuf'un en riskli adımıydı.
- Karar: derleme **sunucuda** (`NEXT_PUBLIC_*` yok, ama `prisma generate` ve platforma özgü `sharp` zaten sunucuda kurulmalı).
- [x] **Temiz kurulum provası (Laragon, 2026-10-09):** Yusuf'a gidecek klasör (node_modules/.next/.env hariç, 673 KB)
      ayrı yere kopyalandı, boş `seker_prova` veritabanına `npm ci` → `prisma generate` → `migrate deploy` → seed
      (ikinci seed dokunmadı) → `yonetici-ac.ts` → `npm run build` → `TZ=UTC next start` → **87/87**. Prova DB silindi.
- [x] Provada yakalandı: **ana sayfa derlemede donuyordu** (`x-nextjs-prerender: 1`, `s-maxage=31536000`) — panel
      değişikliği canlıda hiç görünmeyecekti; dev'de görünmez. `vitrin.ts`'teki her okuma `connection()` ile başlıyor.
      Test eklendi; düzeltmesiz derlemede kırıldığı görüldü.
- [ ] Linux'a özgü kısımlar (systemd, Caddy, ufw, yedek betiği) denenmedi — Yusuf kurarken KANIT komutlarıyla görülecek
- [ ] Üretim derlemesinde (`npm run build` + `next start`) bütün testler + `TZ=UTC` ile tekrar
- [ ] Teslim ZIP'i: node_modules/.next/.env/yüklemeler HARİÇ — içerik listesi kontrol edilir

## Araştırma
Firma hakkındaki araştırma notu yerelde tutulur (`notlar/arastirma-ercan-seker.md`, depoya girmez — gerçek kişi hakkında).

## Açık sorular
- [ ] Şeker Medya ↔ Çankırı Postası ilişkisi, sitede nasıl anılacak
- [ ] LinkedIn PDF/ekran görüntüsü, öne çıkan 6 proje, izinli kurum logoları, drone lisansı, adres
- [ ] Yeni teklif bildirimi: e-posta (SMTP gerekir) mi, web push mu? (karar 0004)
- [ ] KVKK aydınlatma metni (firmadan)
- [ ] Prototip ZIP, logo, showreel, proje içerikleri, marka logoları, iletişim bilgileri (firmadan, Yusuf üzerinden)
- [ ] Alan adı (canonical/paylaşım adresleri `SITE_URL`'den, kurulumda girilir)

## Yerel çalışma
- MySQL: Laragon 8.0.30 — kapalıysa: `C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqld.exe --defaults-file=...\my.ini`
- `npm run dev` → http://localhost:3060 · Panel: `/panel` — `yonetici`, şifre `.env`'deki `SEED_SIFRE_YONETICI`
- Test: dev açıkken `npm test`
- Şifre sıfırlama: `SIFRE=... npx tsx tools/yonetici-ac.ts yonetici`
