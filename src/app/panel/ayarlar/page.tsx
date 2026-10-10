import { sayfaOturumu } from "@/lib/guard";
import { Settings } from "@/components/panel/Settings";

export default async function AyarlarPage() {
  await sayfaOturumu();
  return <Settings />;
}
