"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, Check, RotateCcw } from "lucide-react";
import type { Vitrin } from "@/lib/vitrin";

type ApiError = { hata: string; alan?: string };
const inputNames = ["ad", "telefon", "eposta", "firma", "hizmet", "etkinlikTarihi", "mesaj", "kvkk"];
const tokenProblem = "Form hazırlanamadı. Tekrar deneyin veya telefon / WhatsApp üzerinden ulaşın.";

async function requestToken(signal?: AbortSignal): Promise<string> {
  const res = await fetch("/api/teklif/jeton", { cache: "no-store", signal });
  const data = await res.json();
  if (!res.ok || typeof data.jeton !== "string") throw new Error("Jeton alınamadı");
  return data.jeton;
}

export function QuoteForm({ services, selected = "", whatsapp }: {
  services: Vitrin["hizmetler"]; selected?: string; whatsapp: string | null;
}) {
  const id = useId();
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [tokenError, setTokenError] = useState("");
  const lock = useRef(false);
  const thankYou = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const choices = [...services.map((s) => s.baslik), "Diğer"];

  const getToken = useCallback(async (signal?: AbortSignal) => {
    try {
      setToken(await requestToken(signal));
      setTokenError("");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setTokenError(tokenProblem);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    requestToken(controller.signal).then((jeton) => {
      setToken(jeton);
    }).catch((e: unknown) => {
      if (!(e instanceof Error && e.name === "AbortError")) setTokenError(tokenProblem);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => { if (success) thankYou.current?.focus(); }, [success]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Ref kilidi, React henüz düğmeyi kilitlemeden gelen ikinci gönderimi de durdurur.
    if (lock.current || !token) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const fields = Object.fromEntries(data.entries());
    try {
      const res = await fetch("/api/teklif", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, kvkk: data.get("kvkk") === "on", jeton: token }),
      });
      const result = await res.json();
      if (res.status === 201 && result.ok) {
        setSuccess(true);
      } else {
        const problem: ApiError = { hata: result.hata || "Talep gönderilemedi. Lütfen tekrar deneyin.", alan: result.alan };
        setError(problem);
        if (res.status === 400 && problem.alan === "jeton") {
          setToken("");
          await getToken();
        }
        requestAnimationFrame(() => {
          const field = problem.alan ? form.current?.elements.namedItem(problem.alan) : null;
          if (field instanceof HTMLElement) field.focus();
          else form.current?.querySelector<HTMLElement>("[role='alert']")?.focus();
        });
      }
    } catch {
      setError({ hata: "Bağlantı kurulamadı. Lütfen tekrar deneyin veya telefon / WhatsApp üzerinden ulaşın." });
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const fieldError = (name: string) => error?.alan === name;
  const hint = (name: string) => fieldError(name) ? `${id}-${name}-error` : undefined;
  const message = (name: string) => fieldError(name) && (
    <span className="field-error" id={`${id}-${name}-error`} role="alert">{error?.hata}</span>
  );

  if (success) return (
    <div className="thank-you" ref={thankYou} tabIndex={-1} role="status">
      <span className="success-disc"><Check size={30} aria-hidden="true" /></span>
      <h2>Talebiniz alındı</h2><p>Talebiniz alındı, en kısa sürede dönüş yapacağız.</p>
      {whatsapp && <a href={whatsapp} className="button primary" target="_blank" rel="noopener noreferrer">WhatsApp</a>}
    </div>
  );

  return (
    <form method="post" action="/api/teklif" ref={form} onSubmit={submit} className="quote-form" aria-busy={busy}>
      {error && (!error.alan || !inputNames.includes(error.alan)) && (
        <p className="form-error" role="alert" tabIndex={-1}>{error.hata}</p>
      )}
      {tokenError && <div className="form-error" role="alert">
        <p>{tokenError}</p>
        <button type="button" className="text-link" onClick={() => void getToken()}>
          <RotateCcw size={16} aria-hidden="true" />Tekrar dene
        </button>
      </div>}
      <fieldset disabled={busy}>
        <legend className="sr-only">Proje teklif bilgileri</legend>
        <div className="form-grid">
          <label htmlFor={`${id}-ad`}>Ad soyad <span aria-hidden="true">*</span>
            <input id={`${id}-ad`} name="ad" required autoComplete="name" minLength={2} maxLength={80}
              aria-invalid={fieldError("ad")} aria-describedby={hint("ad")} />{message("ad")}
          </label>
          <label htmlFor={`${id}-telefon`}>Telefon <span aria-hidden="true">*</span>
            <input id={`${id}-telefon`} name="telefon" type="tel" inputMode="tel" autoComplete="tel" required maxLength={20}
              aria-invalid={fieldError("telefon")} aria-describedby={hint("telefon")} />{message("telefon")}
          </label>
          <label htmlFor={`${id}-eposta`}>E-posta
            <input id={`${id}-eposta`} name="eposta" type="email" autoComplete="email" maxLength={120}
              aria-invalid={fieldError("eposta")} aria-describedby={hint("eposta")} />{message("eposta")}
          </label>
          <label htmlFor={`${id}-firma`}>Firma / kurum
            <input id={`${id}-firma`} name="firma" autoComplete="organization" maxLength={120}
              aria-invalid={fieldError("firma")} aria-describedby={hint("firma")} />{message("firma")}
          </label>
          <label htmlFor={`${id}-hizmet`}>Hizmet
            <select id={`${id}-hizmet`} name="hizmet" defaultValue={choices.includes(selected) ? selected : ""}
              aria-invalid={fieldError("hizmet")} aria-describedby={hint("hizmet")}>
              <option value="">Hizmet seçin</option>{choices.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>{message("hizmet")}
          </label>
          <label htmlFor={`${id}-etkinlikTarihi`}>Etkinlik / çekim tarihi
            <input id={`${id}-etkinlikTarihi`} name="etkinlikTarihi" type="date"
              aria-invalid={fieldError("etkinlikTarihi")} aria-describedby={hint("etkinlikTarihi")} />{message("etkinlikTarihi")}
          </label>
          <label htmlFor={`${id}-mesaj`} className="full-width">Mesaj <span aria-hidden="true">*</span>
            <textarea id={`${id}-mesaj`} name="mesaj" required rows={5} minLength={10} maxLength={3000}
              aria-invalid={fieldError("mesaj")} aria-describedby={hint("mesaj")} />{message("mesaj")}
          </label>
        </div>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor={`${id}-web_sitesi`}>Web sitesi</label>
          <input id={`${id}-web_sitesi`} name="web_sitesi" tabIndex={-1} autoComplete="off" />
        </div>
        <label className="checkbox-label" htmlFor={`${id}-kvkk`}>
          <input id={`${id}-kvkk`} name="kvkk" type="checkbox" required
            aria-invalid={fieldError("kvkk")} aria-describedby={hint("kvkk")} />
          <span>Kişisel verilerimin teklif için işlenmesini kabul ediyorum <span aria-hidden="true">*</span></span>
        </label>{message("kvkk")}
        <p className="form-note">* Zorunlu alanlar</p>
        <button type="submit" className="button primary submit-button" disabled={!token || busy}>
          {busy ? "Gönderiliyor…" : "Teklif talebini gönder"}<ArrowUpRight size={20} aria-hidden="true" />
        </button>
      </fieldset>
      <noscript>
        <p className="form-note">Formu göndermek için JavaScript’i açın veya telefon / WhatsApp üzerinden ulaşın.</p>
      </noscript>
    </form>
  );
}
