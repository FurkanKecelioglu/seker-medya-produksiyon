#!/bin/bash
# /usr/local/sbin/seker-yedek.sh — günlük yedek: veritabanı + yüklenen dosyalar.
# Uygulama dizininin DIŞINDA durur ve npm script'ine bağlı değildir: uygulama klasörü
# silinip yeniden kopyalansa da yedek sessizce durmasın (rehber §7.5/26).
# cron: /etc/cron.d/seker-yedek →  30 3 * * * root /usr/local/sbin/seker-yedek.sh >> /var/log/seker-yedek.log 2>&1
set -euo pipefail
umask 077
HEDEF=/var/backups/seker
GUN=$(date +%F)
mkdir -p "$HEDEF"

# Veritabanı. Kimlik /root/.my.cnf'den — komut satırında parola görünmesin.
mysqldump --single-transaction --routines --triggers --no-tablespaces seker | gzip > "$HEDEF/db-$GUN.sql.gz"
gunzip -t "$HEDEF/db-$GUN.sql.gz"
# Boş yedek sessiz arızadır: tablo yoksa (yanlış veritabanı, boş kurulum) hata ver (rehber §7.26/150)
if ! zcat "$HEDEF/db-$GUN.sql.gz" | grep -q 'CREATE TABLE `Yonetici`'; then
  echo "$(date '+%F %T') HATA: yedekte Yonetici tablosu yok" >&2
  exit 1
fi

# Yüklenen fotoğraflar ve açılış videosu. Proje videoları YouTube'da (karar 0002),
# bu klasör küçük kalır.
tar -czf "$HEDEF/yuklemeler-$GUN.tar.gz" -C /var/lib/seker yuklemeler

# Ay başı arşivi kalır, günlükler 30 gün
if [ "$(date +%d)" = "01" ]; then
  cp "$HEDEF/db-$GUN.sql.gz" "$HEDEF/aylik-db-$GUN.sql.gz"
  cp "$HEDEF/yuklemeler-$GUN.tar.gz" "$HEDEF/aylik-yuklemeler-$GUN.tar.gz"
fi
find "$HEDEF" -name 'db-*.sql.gz' -mtime +30 -delete
find "$HEDEF" -name 'yuklemeler-*.tar.gz' -mtime +30 -delete

# Sunucu dışına kopya: sunucu ölürse üstündeki yedek de ölür (rehber §10.6).
# rclone uzak hedefi kurulduktan sonra açılır (KURULUM.md §8):
# rclone copy "$HEDEF" uzak:seker-yedek --max-age 48h

echo "$(date '+%F %T') yedek tamam: $(du -sh "$HEDEF" | cut -f1)"
