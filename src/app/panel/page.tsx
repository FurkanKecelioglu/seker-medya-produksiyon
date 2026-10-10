import { redirect } from "next/navigation";
import { sayfaOturumu } from "@/lib/guard";
import { panelYolu } from "@/components/panel/menu";

export default async function PanelPage() {
  await sayfaOturumu();
  redirect(panelYolu("Teklifler"));
}
