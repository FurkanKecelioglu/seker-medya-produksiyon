import Link from "next/link";

export function MissingPage() {
  return (
    <section className="fallback-page section-pad">
      <p className="eyebrow">404</p><h1>Bu sahne bulunamadı.</h1>
      <p className="muted">Aradığınız sayfa kaldırılmış veya adresi değişmiş olabilir.</p>
      <div className="button-row"><Link href="/" className="button outline">Ana Sayfa</Link>
        <Link href="/teklif-al" className="button primary">Proje Teklifi Al</Link>
      </div>
    </section>
  );
}
