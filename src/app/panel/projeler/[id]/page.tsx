import { notFound } from "next/navigation";
import { sayfaOturumu } from "@/lib/guard";
import { ProjectEditor } from "@/components/panel/ProjectEditor";

export default async function ProjePage({ params }: { params: Promise<{ id: string }> }) {
  await sayfaOturumu();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <ProjectEditor id={id} />;
}
