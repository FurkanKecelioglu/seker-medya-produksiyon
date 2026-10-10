import type { Metadata } from "next";
import { projeListesi, vitrinVerisi } from "@/lib/vitrin";
import { kategoriYoldan } from "@/lib/kategoriler";
import { PageHeading, ProjectCard } from "@/components/site/Sections";

export async function generateMetadata(): Promise<Metadata> {
  const v = await vitrinVerisi();
  return { title: "Projeler", description: v.firma.altSlogan, alternates: { canonical: "/projeler" } };
}

export default async function Projects({ searchParams }: {
  searchParams: Promise<{ kategori?: string | string[] }>;
}) {
  const [v, all, query] = await Promise.all([vitrinVerisi(), projeListesi(), searchParams]);
  const code = kategoriYoldan(typeof query.kategori === "string" ? query.kategori : null);
  const selected = v.kategoriler.find((k) => k.kod === code);
  const projects = selected ? all.filter((p) => p.kategori === selected.kod) : all;
  return (
    <section className="inner-page section-pad">
      <PageHeading title="Projeler" />
      <nav className="category-tabs" aria-label="Proje kategorileri">
        {/* Tam sayfa bağlantısı, JS kapalıyken de sunucuda süzülen sonucu açar. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/projeler" aria-current={!selected ? "page" : undefined}>Tümü <span>{all.length}</span></a>
        {v.kategoriler.map((k) => (
          <a key={k.kod} href={`/projeler?kategori=${k.yol}`} aria-current={selected?.kod === k.kod ? "page" : undefined}>
            {k.ad}<span>{k.adet}</span>
          </a>
        ))}
      </nav>
      {projects.length ? <div className="projects-grid">{projects.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
        : <div className="empty-state"><h2>Henüz proje yok</h2><p>Yayınlanan projeler burada yer alacak.</p></div>}
    </section>
  );
}
