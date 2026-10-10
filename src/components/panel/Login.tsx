"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { api, ApiHatasi } from "./api";
import { useHydrated, useIslem } from "./hooks";
import { PANEL } from "./menu";
import { Alan, Hata } from "./ui";

export function Login() {
  const [goster, setGoster] = useState(false);
  const [saniye, setSaniye] = useState(0);
  const hazir = useHydrated();
  const is = useIslem();
  const { setHata } = is;
  useEffect(() => {
    void api("/ben", "GET", undefined, false).then(() => window.location.replace(PANEL)).catch((e: ApiHatasi) => {
      if (e.durum !== 401) setHata(e);
    });
  }, [setHata]);
  useEffect(() => {
    if (saniye <= 0) return;
    const timer = setTimeout(() => setSaniye((n) => Math.max(0, n - 1)), 1000);
    return () => clearTimeout(timer);
  }, [saniye]);
  return <section className="p-login-card"><div className="p-login-icon"><LockKeyhole size={26} /></div>
    <h1>Hoş geldiniz</h1><p className="p-help">Tekliflerinizi ve sitenizi buradan yönetin.</p>
    <form method="post" onSubmit={(e) => {
      e.preventDefault();
      if (saniye > 0) return;
      const form = new FormData(e.currentTarget);
      void is.calistir(async () => {
        try {
          await api("/giris", "POST", Object.fromEntries(form), false);
          window.location.replace(PANEL);
        } catch (err) {
          if (err instanceof ApiHatasi && err.durum === 429) setSaniye(err.tekrarSn || 1);
          throw err;
        }
      });
    }}>
      <Alan ad="kullaniciAdi" etiket="Kullanıcı adı" hata={is.hata}>
        <input id="kullaniciAdi" name="kullaniciAdi" type="text" autoCapitalize="none" autoCorrect="off"
          autoComplete="username" required disabled={is.mesgul} />
      </Alan>
      <Alan ad="sifre" etiket="Şifre" hata={is.hata}><div className="p-password">
        <input id="sifre" name="sifre" type={goster ? "text" : "password"} autoComplete="current-password"
          required disabled={is.mesgul} />
        <button type="button" className="p-icon" disabled={!hazir} aria-label={goster ? "Şifreyi gizle" : "Şifreyi göster"}
          onClick={() => setGoster(!goster)}>{goster ? <EyeOff size={20} /> : <Eye size={20} />}</button>
      </div></Alan>
      <Hata hata={is.hata} />{saniye > 0 && <p role="status" className="p-help">{saniye} sn sonra tekrar deneyin</p>}
      <button type="submit" className="p-btn p-primary p-wide" disabled={!hazir || is.mesgul || saniye > 0}>
        {is.mesgul ? "Giriş yapılıyor…" : "Giriş yap"}</button>
    </form>
  </section>;
}
