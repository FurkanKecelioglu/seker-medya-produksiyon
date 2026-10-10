import { BrandIcon } from "./BrandIcon";
import type { Vitrin } from "@/lib/vitrin";

const hesaplar = [
  { anahtar: "instagram", ad: "Instagram" },
  { anahtar: "youtube", ad: "YouTube" },
  { anahtar: "facebook", ad: "Facebook" },
  { anahtar: "linkedin", ad: "LinkedIn" },
] as const;

export function SocialLinks({ sosyal }: { sosyal: Vitrin["sosyal"] }) {
  return (
    <div className="social-links">
      {hesaplar.map(({ anahtar, ad }) => sosyal[anahtar] && (
        <a key={anahtar} href={sosyal[anahtar]} target="_blank" rel="noopener noreferrer" aria-label={ad}>
          <BrandIcon name={anahtar} />
        </a>
      ))}
    </div>
  );
}
