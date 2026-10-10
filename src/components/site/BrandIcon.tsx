// Lucide 1.x marka ikonlarını kaldırdı; bağlantıların tanınması için yerel SVG kullanılır.
export function BrandIcon({ name }: { name: "instagram" | "youtube" | "facebook" | "linkedin" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "instagram" && <>
        <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none" />
      </>}
      {name === "youtube" && <>
        <rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3Z" />
      </>}
      {name === "facebook" && <path d="M14 22V13h3l.5-4H14V7c0-1 .5-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v9" />}
      {name === "linkedin" && <>
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 10v7m4 0v-7m0 3c0-4 6-4 6 0v4" />
        <circle cx="7" cy="7" r=".6" fill="currentColor" />
      </>}
    </svg>
  );
}
