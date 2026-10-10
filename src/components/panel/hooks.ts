"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiHatasi } from "./api";

export { useHydrated } from "@/components/site/useHydrated";

export function useVeri<T>(yol: string) {
  const [veri, setVeri] = useState<T | null>(null);
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(true);
  const nesil = useRef(0);
  const yenile = useCallback(async () => {
    const sira = ++nesil.current;
    setBekliyor(true);
    setHata("");
    try {
      const gelen = await api<T>(yol);
      if (sira === nesil.current) setVeri(gelen);
    } catch (e) {
      if (sira === nesil.current) setHata((e as Error).message);
    } finally {
      if (sira === nesil.current) setBekliyor(false);
    }
  }, [yol]);
  useEffect(() => {
    const timer = setTimeout(() => void yenile(), 0);
    const siraRef = nesil;
    return () => { clearTimeout(timer); siraRef.current++; };
  }, [yenile]);
  return { veri, hata, bekliyor, yenile, setVeri };
}

export function useIslem() {
  const kilit = useRef(false);
  const [mesgul, setMesgul] = useState(false);
  const [hata, setHata] = useState<ApiHatasi | null>(null);
  async function calistir(is: () => Promise<void>) {
    if (kilit.current) return;
    kilit.current = true;
    setMesgul(true);
    setHata(null);
    try { await is(); }
    catch (e) { setHata(e instanceof ApiHatasi ? e : new ApiHatasi((e as Error).message)); }
    finally { kilit.current = false; setMesgul(false); }
  }
  return { mesgul, hata, setHata, calistir };
}

export function useAyrilmaUyarisi(degisti: boolean) {
  useEffect(() => {
    if (!degisti) return;
    const uyari = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    const tiklama = (e: MouseEvent) => {
      const bag = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!bag || bag.target === "_blank" || bag.href === window.location.href) return;
      if (!window.confirm("Kaydedilmemiş değişiklikler var. Sayfadan ayrılmak istiyor musunuz?")) {
        e.preventDefault(); e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", uyari);
    document.addEventListener("click", tiklama, true);
    return () => {
      window.removeEventListener("beforeunload", uyari);
      document.removeEventListener("click", tiklama, true);
    };
  }, [degisti]);
}
