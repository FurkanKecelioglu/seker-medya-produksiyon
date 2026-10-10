import { sayfaOturumu } from "@/lib/guard";
import { Password } from "@/components/panel/Password";

export default async function SifrePage() {
  await sayfaOturumu();
  return <Password />;
}
