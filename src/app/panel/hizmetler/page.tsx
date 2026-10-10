import { sayfaOturumu } from "@/lib/guard";
import { Services } from "@/components/panel/Services";

export default async function HizmetlerPage() {
  await sayfaOturumu();
  return <Services />;
}
