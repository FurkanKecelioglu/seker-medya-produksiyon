// POST /api/panel/cikis
import { NextResponse } from "next/server";
import { oturumKapat } from "@/lib/oturum";

export async function POST() {
  await oturumKapat();
  return NextResponse.json({ ok: true });
}
