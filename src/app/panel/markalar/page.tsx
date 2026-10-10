import { sayfaOturumu } from "@/lib/guard";
import { Brands } from "@/components/panel/Brands";

export default async function MarkalarPage() {
  await sayfaOturumu();
  return <Brands />;
}
