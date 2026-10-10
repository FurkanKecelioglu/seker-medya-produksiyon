import { sayfaOturumu } from "@/lib/guard";
import { Projects } from "@/components/panel/Projects";

export default async function ProjelerPage() {
  await sayfaOturumu();
  return <Projects />;
}
