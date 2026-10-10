-- CreateTable
CREATE TABLE `Yonetici` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ad` VARCHAR(80) NOT NULL,
    `kullaniciAdi` VARCHAR(40) NOT NULL,
    `sifreHash` VARCHAR(100) NOT NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `oturumNo` INTEGER NOT NULL DEFAULT 0,
    `olusturma` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `guncelleme` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Yonetici_kullaniciAdi_key`(`kullaniciAdi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ayar` (
    `anahtar` VARCHAR(60) NOT NULL,
    `deger` TEXT NOT NULL,
    `guncelleme` DATETIME(3) NOT NULL,

    PRIMARY KEY (`anahtar`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hizmet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `baslik` VARCHAR(80) NOT NULL,
    `ozet` VARCHAR(300) NOT NULL,
    `ikon` VARCHAR(40) NOT NULL,
    `sira` INTEGER NOT NULL DEFAULT 0,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `olusturma` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `guncelleme` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proje` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(120) NOT NULL,
    `baslik` VARCHAR(120) NOT NULL,
    `kategori` ENUM('VIDEO', 'FOTOGRAF', 'DRONE', 'CANLI_YAYIN', 'TV') NOT NULL,
    `musteri` VARCHAR(120) NULL,
    `yil` INTEGER NULL,
    `ozet` VARCHAR(300) NOT NULL,
    `aciklama` TEXT NULL,
    `kapak` VARCHAR(120) NULL,
    `kapakGenislik` INTEGER NULL,
    `kapakYukseklik` INTEGER NULL,
    `videoSaglayici` VARCHAR(10) NULL,
    `videoKimlik` VARCHAR(40) NULL,
    `oneCikan` BOOLEAN NOT NULL DEFAULT false,
    `yayinda` BOOLEAN NOT NULL DEFAULT false,
    `sira` INTEGER NOT NULL DEFAULT 0,
    `olusturma` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `guncelleme` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Proje_slug_key`(`slug`),
    INDEX `Proje_yayinda_kategori_sira_idx`(`yayinda`, `kategori`, `sira`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Foto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projeId` INTEGER NULL,
    `dosya` VARCHAR(120) NOT NULL,
    `genislik` INTEGER NOT NULL,
    `yukseklik` INTEGER NOT NULL,
    `aciklama` VARCHAR(200) NULL,
    `galeride` BOOLEAN NOT NULL DEFAULT true,
    `sira` INTEGER NOT NULL DEFAULT 0,
    `olusturma` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Foto_projeId_sira_idx`(`projeId`, `sira`),
    INDEX `Foto_galeride_sira_idx`(`galeride`, `sira`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Marka` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ad` VARCHAR(120) NOT NULL,
    `logo` VARCHAR(120) NULL,
    `logoGenislik` INTEGER NULL,
    `logoYukseklik` INTEGER NULL,
    `url` VARCHAR(300) NULL,
    `sira` INTEGER NOT NULL DEFAULT 0,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `olusturma` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `guncelleme` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeklifTalebi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ad` VARCHAR(80) NOT NULL,
    `telefon` VARCHAR(20) NOT NULL,
    `eposta` VARCHAR(120) NULL,
    `firma` VARCHAR(120) NULL,
    `hizmet` VARCHAR(80) NULL,
    `etkinlikTarihi` VARCHAR(10) NULL,
    `mesaj` TEXT NOT NULL,
    `durum` ENUM('YENI', 'ARANDI', 'TEKLIF_VERILDI', 'KAZANILDI', 'KAPANDI') NOT NULL DEFAULT 'YENI',
    `icNot` TEXT NULL,
    `ip` VARCHAR(64) NULL,
    `olusturma` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `guncelleme` DATETIME(3) NOT NULL,

    INDEX `TeklifTalebi_durum_olusturma_idx`(`durum`, `olusturma`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IslemKaydi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `yoneticiId` INTEGER NULL,
    `eylem` VARCHAR(40) NOT NULL,
    `detay` TEXT NOT NULL,
    `ip` VARCHAR(64) NULL,
    `tarih` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IslemKaydi_tarih_idx`(`tarih`),
    INDEX `IslemKaydi_eylem_idx`(`eylem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Foto` ADD CONSTRAINT `Foto_projeId_fkey` FOREIGN KEY (`projeId`) REFERENCES `Proje`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IslemKaydi` ADD CONSTRAINT `IslemKaydi_yoneticiId_fkey` FOREIGN KEY (`yoneticiId`) REFERENCES `Yonetici`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

