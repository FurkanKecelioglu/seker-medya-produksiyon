import { sayfaOturumu } from "@/lib/guard";
import { Offers } from "@/components/panel/Offers";

export default async function TekliflerPage() {
  await sayfaOturumu();
  return <Offers />;
}
