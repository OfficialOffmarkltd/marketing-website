import { RoutePlaceholder } from "@/components/layout/route-placeholder";
import { getServerDataSource } from "@/data/source.server";

export default async function Page() {
  const drops = await getServerDataSource().listDrops();
  return (
    <RoutePlaceholder
      title="Offmark collections"
      lead="Original designs, made to preorder. Collection details are coming soon."
      detail={
        drops.length === 0
          ? "No active or archived collections have been published."
          : `${drops.length} labelled preview ${drops.length === 1 ? "drop is" : "drops are"} available for interface review.`
      }
    />
  );
}
