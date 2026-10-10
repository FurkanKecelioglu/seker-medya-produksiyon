"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { VideoBilgisi } from "@/lib/video";
import type { Gorsel } from "@/lib/vitrin";
import { Visual } from "./Visual";
import { useHydrated } from "./useHydrated";

export function VideoCard({ video, cover, title }: { video: VideoBilgisi; cover?: Gorsel | null; title: string }) {
  const [playing, setPlaying] = useState(false);
  const hydrated = useHydrated();
  const poster = cover ?? (video.kucukResim ? { url: video.kucukResim, genislik: 480, yukseklik: 360 } : null);
  return (
    <div className="video-card" data-video-card>
      {playing ? (
        <iframe src={video.gommeAdresi} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      ) : (
        <button type="button" className="video-play" disabled={!hydrated}
          onClick={() => setPlaying(true)} aria-label={`${title} — videoyu oynat`}>
          <Visual image={poster} alt={title} sizes="(max-width: 767px) 100vw, 90vw" />
          <span className="play-disc"><Play size={28} aria-hidden="true" /></span>
          <span className="video-caption">{title}<span>Oynat</span></span>
        </button>
      )}
    </div>
  );
}
