// Prisma istemcisi — tekil örnek.
// Tekil örnek HER ORTAMDA global'e yazılır: yalnız geliştirmede yazıldığında
// üretimde her route parçası kendi istemcisini kurup ayrı havuz açıyordu ve
// yoğun saatte "pool timeout" alınıyordu (rehber §7.1/5).
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const g = globalThis as unknown as { prisma?: PrismaClient };

function istemciKur() {
  const url = process.env.DATABASE_URL;
  // Bağlantı dizesi yoksa varsayılana düşme, dur (rehber §7.7/45).
  if (!url) throw new Error("DATABASE_URL tanımlı değil");
  // Dize KONUMSAL verilir: { url } nesnesi verilirse sürücü işletim sistemi
  // kullanıcısına düşer ve hata "pool timeout" kılığında gelir (rehber §7.15/79).
  return new PrismaClient({ adapter: new PrismaMariaDb(url) });
}

export const prisma = g.prisma ?? istemciKur();
g.prisma = prisma;
