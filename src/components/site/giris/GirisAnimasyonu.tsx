// Giriş animasyonu — yalnız ana sayfada, oturumda bir kez (karar 0002 eki, Görev 03).
//
// Varsayılan: KODLA çizilen "kamera vizöründen açılış" (video dosyası yok, 0 MB; zemin açılışın
// kendi görseli olduğu için firma panelden görseli değiştirince animasyon da değişir).
// Firma ileride panelden gerçek bir film yüklerse (`medya.girisVideosu`) onun yerine o oynar.
//
// Oturum betiği kök layout'un head bölümündedir: perde ilk boyada bile doğru kararı kullanır.
import type { Vitrin } from "@/lib/vitrin";
import { Visual } from "../Visual";
import { GirisPerdesi } from "./GirisPerdesi";

export function GirisAnimasyonu({ v }: { v: Vitrin }) {
  return (
    <>
      {/* JS kapalıysa perde hiç çizilmez (betik de çalışmadığı için işaret yok) */}
      <noscript>
        <style>{"html{overflow:visible!important}[data-giris-perde],[data-giris-gec]{display:none!important}"}</style>
      </noscript>
      <GirisPerdesi
        firmaAdi={v.firma.ad}
        video={v.medya.girisVideosu}
        zemin={<Visual image={v.medya.acilisPosteri} alt="" priority sizes="100vw" />}
      />
    </>
  );
}
