// Prisma CLI yapılandırması. .env'i kendisi yükler: CLI Next'in ortam
// yükleyicisinden geçmez (rehber §7.7/45 — sessiz yanlış hedef).
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
