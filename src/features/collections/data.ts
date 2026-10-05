import type { PublicContentReader } from "@/data/contracts";
import type { Design, Drop } from "@/domain/catalog";

export type DropWithDesigns = { drop: Drop; designs: Design[] };

async function loadDesigns(source: PublicContentReader, drop: Drop) {
  return (
    await Promise.all(drop.designIds.map((id) => source.getDesign(id)))
  ).filter(
    (design): design is Design => design !== null && design.dropId === drop.id,
  );
}

export async function loadCollectionsData(source: PublicContentReader) {
  const drops = await source.listDrops();
  return Promise.all(
    drops.map(async (drop) => ({
      drop,
      designs: await loadDesigns(source, drop),
    })),
  );
}

export async function loadDropData(
  source: PublicContentReader,
  dropSlug: string,
): Promise<DropWithDesigns | null> {
  const drop = await source.getDrop(dropSlug);
  if (!drop) return null;
  return { drop, designs: await loadDesigns(source, drop) };
}

export async function loadProductData(
  source: PublicContentReader,
  dropSlug: string,
  designSlug: string,
) {
  const result = await loadDropData(source, dropSlug);
  if (!result) return null;
  const design = result.designs.find((item) => item.slug === designSlug);
  return design ? { drop: result.drop, design } : null;
}

export function collectionHref(basePath: string, drop: Drop, design?: Design) {
  return `${basePath}/${drop.slug}${design ? `/${design.slug}` : ""}`;
}
