"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="fallback-page section-pad">
      <p className="eyebrow">Bir sorun oluştu</p><h1>Bu sahneye kısa bir ara.</h1>
      <p className="muted">Sayfa yüklenemedi. Biraz sonra tekrar deneyebilirsiniz.</p>
      <div className="button-row">
        <button type="button" className="button outline" onClick={reset}>Tekrar dene</button>
        <Link href="/" className="button outline">Ana Sayfa</Link>
        <Link href="/teklif-al" className="button primary">Proje Teklifi Al</Link>
      </div>
    </main>
  );
}
