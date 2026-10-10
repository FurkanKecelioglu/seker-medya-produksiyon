import type { ReactNode } from "react";
import { vitrinVerisi } from "@/lib/vitrin";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const v = await vitrinVerisi();
  return (
    <>
      <a className="skip-link" href="#icerik">İçeriğe geç</a>
      <Header firma={v.firma} iletisim={v.iletisim} sosyal={v.sosyal} />
      <main id="icerik">{children}</main>
      <Footer v={v} />
    </>
  );
}
