"use client";

import { useSyncExternalStore } from "react";
import { BAYRAK_BETIGI } from "./girisDurumu";

const aboneOl = () => () => {};
const istemci = () => false;
const ilkHTML = () => true;

export function GirisBaslangici() {
  // Yerel betik HTML ayrıştırılırken çalışır. 404 kök düzeni istemcide yeniden kurarsa
  // çalışmayacak bir script basmak React hatası üretir; hidrasyon sonrası düğüm gereksizdir.
  const ilk = useSyncExternalStore(aboneOl, istemci, ilkHTML);
  return ilk ? <script dangerouslySetInnerHTML={{ __html: BAYRAK_BETIGI }} /> : null;
}
