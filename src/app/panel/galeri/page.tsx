import { sayfaOturumu } from "@/lib/guard";
import { Photos } from "@/components/panel/Photos";
import { Baslik } from "@/components/panel/ui";

export default async function GaleriPage() {
  await sayfaOturumu();
  return <><Baslik baslik="Galeri" aciklama="Projeye bağlı olmayan galeri fotoğraflarını yönetin." /><Photos /></>;
}
