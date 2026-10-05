"use client";

import Image from "next/image";
import { useState } from "react";
import type { Asset } from "@/domain/catalog";

export function ProductGallery({
  images,
  name,
}: {
  images: Asset[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];

  if (!current) {
    return (
      <div
        className="product-gallery-empty"
        role="img"
        aria-label={`Images have not been supplied for ${name}`}
      >
        <span aria-hidden="true">Image pending</span>
        <p className="text-metadata">Garment photography required</p>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      <div className="product-gallery-main">
        <Image
          src={current.src}
          alt={current.alt}
          fill
          sizes="(min-width: 1024px) 58vw, 100vw"
          priority
          unoptimized
        />
      </div>
      {images.length > 1 && (
        <fieldset className="product-gallery-thumbnails">
          <legend className="sr-only">{name} image gallery</legend>
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              className="product-gallery-thumbnail"
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={selected === index ? "true" : undefined}
              onClick={() => setSelected(index)}
            >
              <Image src={image.src} alt="" fill sizes="96px" unoptimized />
            </button>
          ))}
        </fieldset>
      )}
    </div>
  );
}
