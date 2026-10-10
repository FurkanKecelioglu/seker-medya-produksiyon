"use client";

import { useEffect, useState } from "react";

export function HeroVideo({ video, poster }: { video: { url: string; tur: string }; poster?: string }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const desktop = matchMedia("(min-width: 1024px)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & {
      connection?: EventTarget & { saveData?: boolean };
    }).connection;
    const update = () => setEnabled(desktop.matches && !motion.matches && !connection?.saveData);
    update();
    desktop.addEventListener("change", update);
    motion.addEventListener("change", update);
    connection?.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      motion.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
    };
  }, []);
  if (!enabled) return null;
  return (
    <video muted autoPlay loop playsInline poster={poster} aria-hidden="true">
      <source src={video.url} type={video.tur} />
    </video>
  );
}
