"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

export function YoutubeVisual({ url, alt, sizes, priority, natural }: {
  url: string; alt: string; sizes: string; priority: boolean; natural: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(natural ? 1 : 4 / 3);
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    // hqdefault içine gömülü bantları, dikey kartta da oranı bozmadan dışarıda bırakır.
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) setScale(Math.max(1, Math.min(4 / 3, (16 / 9) * height / width)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [natural]);
  return <div ref={frame} className={`youtube-visual ${natural ? "youtube-natural" : ""}`}
    style={{ "--youtube-kirpma": scale } as CSSProperties}>
    <Image src={url} alt={alt} fill sizes={sizes} priority={priority} className="cover-image" />
  </div>;
}
