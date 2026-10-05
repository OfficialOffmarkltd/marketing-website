import type { PublicContentReader } from "@/data/contracts";
import type { Design } from "@/domain/catalog";

export async function loadHomepageData(source: PublicContentReader) {
  const [services, drops, updates] = await Promise.all([
    source.listServices(),
    source.listDrops(),
    source.listBuildUpdates(),
  ]);
  const currentDrop =
    drops.find((drop) => drop.status === "open" || drop.status === "closing") ??
    null;
  const featuredDesigns = currentDrop
    ? (
        await Promise.all(
          currentDrop.designIds.slice(0, 3).map((id) => source.getDesign(id)),
        )
      ).filter((design): design is Design => design !== null)
    : [];

  return {
    services,
    currentDrop,
    featuredDesigns,
    updates: updates.slice(0, 3),
  };
}
