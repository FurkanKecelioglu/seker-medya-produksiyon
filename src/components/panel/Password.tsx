"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { api, ApiHatasi } from "./api";
import { useHydrated, useIslem } from "./hooks";
import { Alan, Baslik, Hata } from "./ui";

export function Password() {
  const is = useIslem();
  const hazir = useHydrated();
  const formRef = useRef<HTMLFormElement>(null);
  return <><Baslik baslik="Şifre değiştir" aciklama="Yeni şifreniz en az 10 karakter olmalı." />
    <form method="post" className="p-card p-narrow" ref={formRef} onSubmit={(e) => {
      e.preventDefault(); const form = new FormData(e.currentTarget);
      if (form.get("yeniSifre") !== form.get("tekrar")) {
        is.setHata(new ApiHatasi("Yeni şifreler eşleşmiyor.", "tekrar")); return;
      }
      void is.calistir(async () => {
        await api("/sifre", "POST", { eskiSifre: form.get("eskiSifre"), yeniSifre: form.get("yeniSifre") });
        formRef.current?.reset(); toast.success("Şifreniz değişti; diğer cihazlardaki oturumlar kapandı.");
      });
    }}><Hata hata={is.hata} />
      <Alan ad="eskiSifre" etiket="Eski şifre" hata={is.hata}>
        <input type="password" name="eskiSifre" id="eskiSifre" autoComplete="current-password" required />
      </Alan>
      <Alan ad="yeniSifre" etiket="Yeni şifre" hata={is.hata}>
        <input type="password" name="yeniSifre" id="yeniSifre" autoComplete="new-password" minLength={10} required />
      </Alan>
      <Alan ad="tekrar" etiket="Yeni şifre tekrar" hata={is.hata}>
        <input type="password" name="tekrar" id="tekrar" autoComplete="new-password" minLength={10} required />
      </Alan>
      <button type="submit" className="p-btn p-primary" disabled={!hazir || is.mesgul}>
        {is.mesgul ? "Kaydediliyor…" : "Şifreyi değiştir"}</button>
    </form></>;
}
