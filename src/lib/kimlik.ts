// Panel giriş kimliği (kullanıcı adı) normalleştirme — kaydederken ve ararken
// aynı fonksiyon (rehber §7.7/41). Deneme sayacının anahtarı da bu değerdir,
// yoksa farklı yazımlarla sınır sıfırlanır.
//
// I/İ/ı elle "i"ye çevrilir: toLocaleLowerCase("tr-TR") büyük "I"yı "ı" yapar, büyük
// harf kilidi açıkken "YONETICI" yazan kişi "yonetıcı" olarak aranır ve giremez;
// "en-US" ise "İ"yi "i̇" (i + birleşik nokta) yapar. Kullanıcı adları ASCII'dir,
// üç yazımın üçü de aynı hesaba gitmeli (2026-10-09 testte yakalandı).
export function kullaniciAdiNormallestir(girdi: string): string {
  return girdi.trim().replace(/[Iİı]/g, "i").toLowerCase().replace(/\s+/g, "");
}

// Şifre alfabesi: telefon klavyesinde tek elle yazılabilir, karışan harf yok
// (l/1/O/0). base64url şifreler iPhone'da yazılamıyordu (rehber §7.3/11).
const ALFABE = "abcdefghjkmnpqrstuvwxyz23456789";

export function rastgeleSifre(uzunluk = 12): string {
  const b = crypto.getRandomValues(new Uint8Array(uzunluk));
  return Array.from(b, (x) => ALFABE[x % ALFABE.length]).join("");
}
