import Image from "next/image";
import type { Asset } from "@/domain/catalog";
import { cn } from "@/lib/utils";

export function CollectionMedia({
  asset,
  label,
  ratio = "portrait",
  priority = false,
  className,
}: {
  asset?: Asset;
  label: string;
  ratio?: "portrait" | "landscape";
  priority?: boolean;
  className?: string;
}) {
  if (!asset) {
    return (
      <div
        className={cn(
          "collection-media-placeholder",
          `collection-media-${ratio}`,
          className,
        )}
        role="img"
        aria-label={`${label}. Image has not been supplied.`}
      >
        <span aria-hidden="true">Image pending</span>
        <p className="text-metadata">{label}</p>
      </div>
    );
  }

  return (
    <div
      className={cn("collection-media", `collection-media-${ratio}`, className)}
    >
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        sizes={
          ratio === "portrait" ? "(min-width: 1024px) 42vw, 100vw" : "100vw"
        }
        priority={priority}
        unoptimized
      />
    </div>
  );
}
