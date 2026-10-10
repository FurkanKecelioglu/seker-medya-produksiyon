import { Bell, Clapperboard, Images, Settings, Briefcase, BadgeCheck, History, KeyRound } from "lucide-react";

export const MENU = [
  { yol: "/panel/teklifler", etiket: "Teklifler", ikon: Bell, rozet: true },
  { yol: "/panel/projeler", etiket: "Projeler", ikon: Clapperboard },
  { yol: "/panel/galeri", etiket: "Galeri", ikon: Images },
  { yol: "/panel/ayarlar", etiket: "Ayarlar", ikon: Settings },
  { yol: "/panel/hizmetler", etiket: "Hizmetler", ikon: Briefcase },
  { yol: "/panel/markalar", etiket: "Markalar", ikon: BadgeCheck },
  { yol: "/panel/kayitlar", etiket: "İşlem kayıtları", ikon: History },
  { yol: "/panel/sifre", etiket: "Şifre", ikon: KeyRound },
];

export const PANEL = "/panel";
export const GIRIS = `${PANEL}/giris`;
export const SITE = "/";
export const panelYolu = (etiket: string) => MENU.find((m) => m.etiket === etiket)!.yol;
export const projeYolu = (id: number | "yeni") => `${panelYolu("Projeler")}/${id}`;
