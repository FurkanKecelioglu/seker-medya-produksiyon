# Şeker Medya web sitesi — sunucuya kurulum

Bu belge kendi başına yeterlidir: boş bir Ubuntu sunucudan HTTPS ile açılan siteye kadar her adım
burada. Her adımın sonunda bir **KANIT** komutu var; çıktısı yazılan gibi değilse sonraki adıma geçmeyin.

Klasördeki dosyalar:
| Dosya | Sunucudaki yeri |
|---|---|
| `seker.service` | `/etc/systemd/system/seker.service` |
| `Caddyfile` | `/etc/caddy/Caddyfile` |
| `seker-yedek.sh` | `/usr/local/sbin/seker-yedek.sh` |

**Geri dönüşü zor iki adım var, işaretlendi (⚠).** Acele etmeyin.

---

## 0. Başlamadan önce gerekenler

- **Sunucu:** Ubuntu 24.04 LTS, en az **2 GB RAM** (4 GB rahat), 30 GB+ disk, sabit IPv4, kontrol paneli
  (cPanel/Plesk) **olmayan** düz VDS. 1 GB'ta derleme ile MySQL birlikte sığmaz.
- **Alan adı** ve DNS paneline erişim. Kök (`ALANADI.com`) ve `www` için A kaydı → sunucu IP'si.
  DNS'in yayılması saatler sürebilir; kayıtları ilk iş girin, kurulum beklerken ilerler.
- **Proje klasörü** — kaynak kod; `node_modules`, `.next` ve `.env` içinde yok, bunlar sunucuda oluşur.

Aşağıda `ALANADI.com` gördüğünüz her yere gerçek alan adını yazın.

---

## 1. SSH — ⚠ sıra önemli

Önce **anahtarla girişi kurup deneyin**, şifreli girişi ancak ondan sonra kapatın. Sıra bozulursa
sunucuya kilitlenirsiniz (kurtarma: sağlayıcının web konsolu).

```bash
# Kendi bilgisayarınızda (anahtarınız yoksa: ssh-keygen -t ed25519)
ssh-copy-id root@SUNUCU_IP
ssh root@SUNUCU_IP          # şifre SORMADAN girmeli — girmiyorsa DURUN
```

Girdiyse sunucuda:
```bash
cat > /etc/ssh/sshd_config.d/00-sertlestirme.conf <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
EOF
systemctl reload ssh
```
Dosya adı `00-` ile başlıyor: SSH'ta **ilk okunan değer kazanır**; `50-cloud-init.conf` daha önce
okunursa şifreli giriş açık kalır.

**KANIT** (dosyaya değil, SSH'ın gerçekte kullandığı değere bakılır):
```bash
sshd -T | grep -E '^(passwordauthentication|permitrootlogin)'
# passwordauthentication no
# permitrootlogin without-password
```
Yeni bir terminalden tekrar girmeyi deneyin; mevcut oturumu, yenisi açılana kadar kapatmayın.

## 2. Temel güvenlik ve saat

```bash
grep -q "$(hostname)" /etc/hosts || echo "127.0.1.1 $(hostname)" >> /etc/hosts
apt update && apt -y upgrade
apt -y install ufw fail2ban unattended-upgrades unzip curl
ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable
timedatectl set-timezone Europe/Istanbul
systemctl enable --now fail2ban
```
**KANIT:**
```bash
ufw status            # Status: active — yalnız 22, 80, 443
timedatectl           # Time zone: Europe/Istanbul (+03)
fail2ban-client status sshd
```

## 3. MySQL 8

```bash
apt -y install mysql-server
cat > /etc/mysql/mysql.conf.d/99-seker.cnf <<'EOF'
[mysqld]
bind-address = 127.0.0.1
mysqlx = 0
EOF
systemctl restart mysql
```

Veritabanı ve uygulama kullanıcısı. Parolayı üretin ve bir kenara yazın — 5. adımda lazım
(yalnız harf+rakam üretilir; `$` gibi işaretler `.env` okurken bozulur):
```bash
openssl rand -hex 24          # çıktı = DB_PAROLASI
mysql <<'EOF'
CREATE DATABASE seker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'seker'@'localhost' IDENTIFIED WITH mysql_native_password BY 'DB_PAROLASI';
CREATE USER 'seker'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'DB_PAROLASI';
GRANT ALL PRIVILEGES ON seker.* TO 'seker'@'localhost';
GRANT ALL PRIVILEGES ON seker.* TO 'seker'@'127.0.0.1';
EOF
```
- `mysql_native_password` **şart**: MySQL 8'in varsayılanıyla uygulamanın sürücüsü bağlanamaz ve hata
  yanıltıcı biçimde "pool timeout" diye gelir.
- Uygulama kullanıcısı yalnız `seker` veritabanını görür; şema güncellemesini (`migrate deploy`)
  kendisi yaptığı için bu veritabanında tam yetkilidir.
- `apt` MySQL **8.4** kurarsa `mysql_native_password` kapalı gelir: `99-seker.cnf`'ye
  `mysql_native_password = ON` ekleyip `systemctl restart mysql`, sonra kullanıcıyı açın.

Yedek betiği parolasız çalışsın diye root için:
```bash
cat > /root/.my.cnf <<'EOF'
[client]
user=root
EOF
chmod 600 /root/.my.cnf
```
(Ubuntu'da MySQL root'u sistem root'uyla parolasız girer — `auth_socket`.)

**KANIT:**
```bash
mysql -e "SELECT @@version, @@bind_address; SELECT user,host,plugin FROM mysql.user WHERE user='seker';"
# 8.0.x, 127.0.0.1 — iki satır, ikisi de mysql_native_password
mysql -useker -p'DB_PAROLASI' -h127.0.0.1 seker -e "SELECT 1"
ss -ltnp | grep 3306          # yalnız 127.0.0.1:3306
```

## 4. Node.js 22 ve Caddy

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt -y install nodejs

apt -y install debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
apt update && apt -y install caddy
```
**KANIT:** `node -v` → `v22.x` · `caddy version` → `v2.x`

## 5. Uygulama kullanıcısı ve proje klasörü

```bash
useradd -r -m -d /opt/seker -s /usr/sbin/nologin seker
mkdir -p /var/lib/seker/yuklemeler
chmod 755 /var/lib/seker /var/lib/seker/yuklemeler   # Caddy bu klasörden okur
```

Projeyi GitHub'dan sunucuya çekin (sunucuda adı `app` olur):
```bash
apt install -y git
git clone https://github.com/FurkanKecelioglu/seker-medya-produksiyon.git /opt/seker/app
```
> Depoda `.env`, `node_modules`, `.next` ve yüklenen dosyalar YOKTUR — bunlar aşağıdaki adımlarda sunucuda oluşur.
> Sonraki güncellemelerde: `cd /opt/seker/app && sudo -u seker git pull`, ardından derleme adımları.
Sunucuda:
```bash
chown -R seker:seker /opt/seker /var/lib/seker
ls /opt/seker/app/package.json    # görünmeli; görünmüyorsa klasör bir kat içeride kalmıştır
```

## 6. Ayarlar, kurulum ve servis

Ayar dosyası **derlemeden önce** yazılır: site adresi `robots.txt`'ye derleme anında işlenir.
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"   # çıktı = OTURUM_SIRRI
nano /opt/seker/app/.env
```
İçine (değerleri kendi bilgilerinizle değiştirerek):
```
DATABASE_URL="mysql://seker:DB_PAROLASI@127.0.0.1:3306/seker"
OTURUM_SIRRI="BURAYA_URETILEN"
SITE_URL="https://ALANADI.com"
YUKLEME_DIZINI="/var/lib/seker/yuklemeler"
SEED_SIFRE_YONETICI=""
```
```bash
chown seker:seker /opt/seker/app/.env && chmod 600 /opt/seker/app/.env
```
- `SITE_URL` **https ile ve sonda / olmadan.** Panel çerezinin güvenli olması, arama motoru ve
  paylaşım (WhatsApp önizleme) adresleri buna bakar.
- `OTURUM_SIRRI` değişirse herkes panelden düşer; kaybolursa yenisi üretilir, zararı bu kadar.
- `SEED_SIFRE_YONETICI` **boş kalır**: panel şifresi rastgele üretilip bir kez ekrana yazılır.

Kurulum (derleme 2 GB'lık makinede birkaç dakika sürer):
```bash
cd /opt/seker/app
sudo -u seker -H npm ci --no-audit --no-fund
sudo -u seker -H npx prisma generate
sudo -u seker -H npx prisma migrate deploy      # tabloları kurar
sudo -u seker -H npm run db:seed                # yönetici hesabı + 8 hizmet
sudo -u seker -H npm run build
```
> ⚠ **Seed çıktısındaki `yonetici açıldı — şifre: …` satırını o an not edin.** Bir daha gösterilmez.
> Kaybolursa: `cd /opt/seker/app && sudo -u seker -H npx tsx tools/yonetici-ac.ts yonetici`
> (yeni şifre üretip yazar).

`prisma` adımı indirme hatasıyla düşerse sunucu `binaries.prisma.sh` adresine çıkamıyor demektir
(bazı sağlayıcılar kapatıyor); sağlayıcıya o adrese çıkışı açtırın.

Servis ve yedek betiği:
```bash
install -m 644 /opt/seker/app/dagitim/seker.service /etc/systemd/system/seker.service
install -m 700 /opt/seker/app/dagitim/seker-yedek.sh /usr/local/sbin/seker-yedek.sh
systemctl daemon-reload
systemctl enable --now seker
```

**KANIT:**
```bash
systemctl is-active seker                          # active
ss -ltnp | grep 3060                               # 127.0.0.1:3060 — *:3060 ya da 0.0.0.0 DEĞİL
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3060/   # 200
curl -sI http://127.0.0.1:3060/ | grep -i cache-control            # no-store (sayfa her istekte üretiliyor)
```

## 7. HTTPS (Caddy)

DNS kayıtları sunucuyu göstermeden sertifika alınamaz. Kontrol: `dig +short ALANADI.com` → sunucu IP'si.

```bash
cp /opt/seker/app/dagitim/Caddyfile /etc/caddy/Caddyfile
sed -i 's/ALANADI\.com/gercekalanadi.com/g' /etc/caddy/Caddyfile     # kendi alan adınız
caddy validate --config /etc/caddy/Caddyfile
mkdir -p /var/log/caddy && chown -R caddy:caddy /var/log/caddy
systemctl restart caddy
```
`chown` satırı atlanmasın: `caddy validate` root olarak günlük dosyasını oluşturur, Caddy servisi sonra
oraya yazamaz ve açılmaz.

**KANIT:**
```bash
journalctl -u caddy --since "5 min ago" | grep -i "certificate obtained"
curl -sI https://ALANADI.com | grep -iE '^(HTTP|strict-transport|x-content-type|x-frame)'
# HTTP/2 200 · strict-transport-security · x-content-type-options: nosniff · x-frame-options
curl -sI https://www.ALANADI.com | grep -i location      # https://ALANADI.com/ adresine yönlendirir
curl -s -o /dev/null -w '%{http_code}\n' http://SUNUCU_IP:3060/   # bağlanamaz (000) — doğrudan erişim kapalı
```

## 8. Yedek

```bash
echo '30 3 * * * root /usr/local/sbin/seker-yedek.sh >> /var/log/seker-yedek.log 2>&1' > /etc/cron.d/seker-yedek
seker-yedek.sh
```
**KANIT — yedek, geri dönülerek kanıtlanır:**
```bash
ls -la /var/backups/seker/                          # db-*.sql.gz ve yuklemeler-*.tar.gz, izinler -rw-------
F=$(ls -t /var/backups/seker/db-*.sql.gz | head -1)
mysql -e "CREATE DATABASE seker_prova"
zcat "$F" | mysql seker_prova
for t in Yonetici Hizmet Proje Foto Marka TeklifTalebi; do
  echo "$t: $(mysql -N -e "SELECT COUNT(*) FROM seker.$t") / $(mysql -N -e "SELECT COUNT(*) FROM seker_prova.$t")"
done                                                # her satırda iki sayı aynı
mysql -e "DROP DATABASE seker_prova"
cat /etc/cron.d/seker-yedek                         # cron gerçekten kurulu
```

## 9. Sunucu dışına yedek (önerilir)

Sunucu ölürse üstündeki yedek de ölür. `rclone` ile bir bulut klasörüne (Google Drive, Backblaze B2,
başka bir sunucu) kopyalanır:
```bash
apt -y install rclone && rclone config      # "uzak" adıyla hedef tanımlayın
```
Sonra `seker-yedek.sh` sonundaki `rclone copy` satırının başındaki `#` kaldırılır.
**KANIT:** betiği elle çalıştırın, `rclone ls uzak:seker-yedek` bugünün dosyalarını göstersin;
birini indirip `gunzip -t` ile açılabildiğini görün.

## 10. Kod değişirse

Önce yedek (`seker-yedek.sh`). Eski klasörü kenara alın (`mv /opt/seker/app /opt/seker/app.eski`), yenisini
5. adımdaki gibi koyun, `.env`i eskisinden kopyalayın (`cp -p /opt/seker/app.eski/.env /opt/seker/app/`),
6. adımdaki kurulum komutlarını **seed hariç** çalıştırın, `systemctl restart seker`. Sorun çıkarsa
eski klasörü geri adlandırıp servisi yeniden başlatmak yeter.

## 11. Canlıya aldıktan sonra — teslim kontrolü

Teknik:
- [ ] `systemctl is-enabled seker mysql caddy fail2ban cron` → hepsi `enabled` (elektrik kesintisinden sonra kendi açılsın)
- [ ] `sudo reboot` → birkaç dakika sonra site kendiliğinden açılıyor
- [ ] Hız sınırı uydurma IP ile aşılamıyor: aşağıdaki döngü aynı IP'den gittiği için 6. istekte `429` görülmeli
  ```bash
  for i in 1 2 3 4 5 6; do curl -s -o /dev/null -w '%{http_code} ' -X POST -H 'Content-Type: application/json' \
    -H "X-Real-IP: 10.0.0.$i" -d '{}' https://ALANADI.com/api/teklif; done; echo
  # 400 400 400 400 400 429  (400: boş form reddedildi — sayılır; 429: sınır)
  ```
  Saatte 5 sınırı sizin IP'nizi bir saat kilitler; denemeyi kurulumun sonunda yapın.

İş:
- [ ] `https://ALANADI.com/panel` → `yonetici` ve not edilen şifreyle giriş → **Şifre değiştir** ile kendi şifreniz
- [ ] Panel → Ayarlar: firma bilgileri, telefon, WhatsApp, e-posta, adres, sosyal medya, logo, açılış videosu/posteri
- [ ] En az bir proje (YouTube bağlantısıyla) **yayında** işaretlenip sitede göründü
- [ ] Gerçek telefondan (Android + iPhone) teklif formu gönderildi → panelde **Teklif talepleri**'nde göründü →
      "WhatsApp'tan dön" düğmesi müşterinin numarasına hazır mesajla açıldı
- [ ] iPhone'dan panele fotoğraf yüklendi (iPhone fotoğrafı kendisi JPEG'e çevirir) ve sitede göründü
- [ ] Açılış videosu iPhone Safari'de oynuyor
- [ ] Google Search Console'a site eklendi, `https://ALANADI.com/sitemap.xml` gönderildi

## Sık karşılaşılan durumlar

| Belirti | Bakılacak yer |
|---|---|
| Site 502 | `journalctl -u seker -n 80` — uygulama açılmamış |
| `pool timeout` hatası | Önce hatanın `cause` kısmını okuyun: çoğu zaman MySQL kullanıcısı `mysql_native_password` değil ya da `.env`'deki parola yanlış |
| Panelde girişten sonra hemen tekrar giriş istiyor | `SITE_URL` https mi, siteye https ile mi giriliyor |
| Yüklenen fotoğraf sitede 404 | `ls -la /var/lib/seker/yuklemeler` — dosya orada mı, `others` okuyabiliyor mu (Caddy okur) |
| Caddy açılmıyor, `permission denied` | `chown -R caddy:caddy /var/log/caddy && systemctl restart caddy` |
| Panel şifresi unutuldu | `cd /opt/seker/app && sudo -u seker -H npx tsx tools/yonetici-ac.ts yonetici` |
| Günlükler | Uygulama `journalctl -u seker` · Caddy `/var/log/caddy/seker-erisim.log` · Yedek `/var/log/seker-yedek.log` |
