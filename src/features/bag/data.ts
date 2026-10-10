import type { PublicContentReader } from "@/data/contracts";
import type { Design, Drop } from "@/domain/catalog";

export type BagCatalogueItem = { drop: Drop; design: Design };

export async function loadBagCatalogue(
  source: PublicContentReader,
): Promise<BagCatalogueItem[]> {
  const drops = await source.listDrops();
  const items = await Promise.all(
    drops.flatMap((drop) =>
      drop.designIds.map(async (id) => ({
        drop,
        design: await source.getDesign(id),
      })),
    ),
  );
  return items.filter(
    (item): item is BagCatalogueItem =>
      item.design !== null && item.design.dropId === item.drop.id,
  );
}
