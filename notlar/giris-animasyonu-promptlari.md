# Giriş animasyonu — ChatGPT (Sora) için promptlar

> **2026-10-10 güncel:** ChatGPT video üretmedi; animasyon KODLA yapılıyor (`codex/GOREV-03-giris-animasyonu.md`).
> Bu promptlar yalnız firma ileride Runway/Sora gibi bir araçla gerçek film üretmek isterse diye duruyor —
> o zaman panelden "Giriş animasyonu" alanlarına yüklenir ve kod animasyonunun yerine geçer.

Sahne (kullanıcı seçti, 2026-10-10): **kamera vizöründen açılış.** Siyah ekran → kırmızı REC noktası yanar →
vizör çerçevesi ve odak netleşir → kamera geri çekilir, sete açılır → koyu, sinematik set; son kare sakin.

Kurallar (iki video için de):
- **Yazı/logo/harf YOK.** Yapay zekâ yazıyı bozar; firma adı ve slogan videonun bittiği anda sitenin kendi
  yazısıyla gelir.
- **Sessiz**, 6–10 sn, döngü değil (bir kez oynar).
- Renk: siyah-koyu gri, tek vurgu **kırmızı** (REC ışığı, tally lambası, kenar ışığı) — sitenin paleti.
- **Son 1,5 sn sakin** ve karanlık kalsın (hareket yavaşlasın): perde kalkarken açılış görseline yumuşak geçilir.
- İnsan yüzü yakın planda olmasın (yapay zekâ yüzleri tuhaf çıkıyor); ekip silüet/arka planda.

## 1) Masaüstü — yatay 16:9, 1920×1080

```
Cinematic 8-second shot, 16:9, no text, no logos, no letters anywhere, silent.
Start on pure black. A small red "recording" dot lights up in the upper corner of a professional
cinema camera viewfinder. Viewfinder framing lines and a focus peaking outline fade in; the image
inside the viewfinder racks from blurry to sharp focus. The camera then slowly dollies backward
out of the viewfinder, revealing a dark, moody film set: a professional cinema camera on a tripod
in the foreground, soft haze, a few practical lights, a distant crew in silhouette, a camera drone
resting on a flight case. Color palette: deep blacks and charcoal greys, a single accent color of
cinema red (the REC light, a red tally lamp, a thin red rim light). Shallow depth of field,
anamorphic lens look, subtle film grain, slow and elegant camera movement.
The final 1.5 seconds are calm and nearly still, dark, with plenty of empty dark space in the
center-left of the frame. Photorealistic, high-end commercial production company intro.
```

## 2) Telefon — dikey 9:16, 1080×1920

```
Cinematic 8-second vertical shot, 9:16, no text, no logos, no letters anywhere, silent.
Start on pure black. A small red "recording" dot lights up at the top of a professional cinema
camera viewfinder. Viewfinder framing lines and a focus peaking outline fade in; the image racks
from blurry to sharp. The camera slowly pulls back out of the viewfinder, revealing a dark film set
composed vertically: a cinema camera on a tripod in the lower third, haze and a few practical
lights above, a crew silhouette far behind. Deep blacks, charcoal greys, single accent color cinema
red (REC light, red tally lamp, thin red rim light). Shallow depth of field, subtle film grain,
slow elegant movement. The final 1.5 seconds are calm, nearly still and dark, with empty dark space
in the middle of the frame. Photorealistic, high-end production company intro.
```

Beğenmezsen ChatGPT'ye şöyle düzelttirebilirsin: "daha yavaş", "kırmızı daha az", "son kare daha karanlık",
"kamera titremesin", "yazı çıkmasın".

## Sonra

Videoları (ve beğendiğin bir son kareyi) bana ver. Ben MP4 + WebM'e sıkıştırırım (hedef: masaüstü ≤ 5 MB,
mobil ≤ 4 MB), son kareden açılış posteri çıkarırım, panelden `Giriş animasyonu — masaüstü / telefon`
alanlarına yüklenir. Bileşeni Codex yazar (API.md → `medya.girisVideosu`).
