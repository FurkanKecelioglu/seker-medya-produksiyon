import { sayfaOturumu } from "@/lib/guard";
import { Logs } from "@/components/panel/Logs";

export default async function KayitlarPage() {
  await sayfaOturumu();
  return <Logs />;
}
