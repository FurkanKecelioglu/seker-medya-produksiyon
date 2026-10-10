import Image from "next/image";
import type { Gorsel } from "@/lib/vitrin";
import { YoutubeVisual } from "./YoutubeVisual";

export function Visual({ image, alt, sizes = "100vw", priority = false, natural = false }: {
  image: Gorsel | null; alt: string; sizes?: string; priority?: boolean; natural?: boolean;
}) {
  if (!image) return <div className="visual-placeholder"><span>{alt}</span></div>;
  if (/^https:\/\/i\.ytimg\.com\/vi\/[^/]+\/hqdefault\.jpg$/.test(image.url)) {
    return <YoutubeVisual url={image.url} alt={alt} sizes={sizes} priority={priority} natural={natural} />;
  }
  if (image.genislik && image.yukseklik) {
    return (
      <Image src={image.url} alt={alt} width={image.genislik} height={image.yukseklik}
        sizes={sizes} priority={priority} className={natural ? "natural-image" : "cover-image"} />
    );
  }
  return (
    <div className={natural ? "unknown-image" : "fill-image"}>
      <Image src={image.url} alt={alt} fill sizes={sizes} priority={priority} />
    </div>
  );
}
