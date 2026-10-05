import { RoutePlaceholder } from "@/components/layout/route-placeholder";
import { getServerDataSource } from "@/data/source.server";

export default async function Page() {
  const updates = await getServerDataSource().listBuildUpdates();
  return (
    <RoutePlaceholder
      title="Building Offmark"
      lead="A place to follow the work. Published updates will appear here."
      detail={
        updates.length === 0
          ? "No evidence-backed updates have been published."
          : `${updates.length} labelled preview ${updates.length === 1 ? "entry is" : "entries are"} available for interface review.`
      }
    />
  );
}
