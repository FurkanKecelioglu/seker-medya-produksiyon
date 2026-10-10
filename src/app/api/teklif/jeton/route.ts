// GET /api/teklif/jeton — teklif formu açılınca çağrılır (lib/teklif.ts, katman 1).
// Önbelleğe alınmamalı: jeton zamanı damgalar, eski jeton 24 saat sonra reddedilir.
import { NextResponse } from "next/server";
import { jetonUret } from "@/lib/teklif";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ jeton: jetonUret() }, { headers: { "Cache-Control": "no-store" } });
}
