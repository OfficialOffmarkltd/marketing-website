import Link from "next/link";
import { Badge } from "@/components/ui/feedback";
import type { Design, Drop } from "@/domain/catalog";
import { formatMoney } from "@/domain/format";
import { collectionHref } from "./data";
import { CollectionMedia } from "./media";
import { dropStatusLabels } from "./status";

export function DesignCard({
  drop,
  design,
  basePath,
}: {
  drop: Drop;
  design: Design;
  basePath: string;
}) {
  const action = drop.status === "retired" ? "View archive" : "View design";
  return (
    <article className="collection-design-card">
      <Link
        href={collectionHref(basePath, drop, design)}
        className="collection-card-media-link"
        aria-label={`${action}: ${design.name}`}
      >
        <CollectionMedia asset={design.images[0]} label={design.name} />
      </Link>
      <div className="collection-design-copy">
        <div className="collection-card-meta">
          <Badge>{dropStatusLabels[drop.status]}</Badge>
          {design.provenance.kind === "demo" && (
            <span className="demo-label">Fictional preview</span>
          )}
        </div>
        <h3 className="heading-card">
          <Link href={collectionHref(basePath, drop, design)}>
            {design.name}
          </Link>
        </h3>
        <p>{design.price ? formatMoney(design.price) : "Price unavailable"}</p>
        <p className="text-metadata">{drop.name}</p>
        <Link
          className="text-link"
          href={collectionHref(basePath, drop, design)}
        >
          {action} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
