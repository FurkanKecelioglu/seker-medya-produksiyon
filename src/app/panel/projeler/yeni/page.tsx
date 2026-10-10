import { sayfaOturumu } from "@/lib/guard";
import { ProjectEditor } from "@/components/panel/ProjectEditor";

export default async function YeniProjePage() {
  await sayfaOturumu();
  return <ProjectEditor />;
}
