import { RoutePlaceholder } from "@/components/layout/route-placeholder";
import { getServerDataSource } from "@/data/source.server";

export default async function Page() {
  const seam = (await getServerDataSource().listServices()).find(
    (service) => service.slug === "seam",
  );
  return (
    <RoutePlaceholder
      title="Seam"
      lead={
        seam?.summary ?? "A standalone fashion design platform from Offmark."
      }
      detail={
        seam?.availability === "unconfirmed"
          ? "Availability has not been confirmed."
          : "This is labelled preview availability, not a launch announcement."
      }
    />
  );
}
