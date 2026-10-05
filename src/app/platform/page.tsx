import { RoutePlaceholder } from "@/components/layout/route-placeholder";
import { getServerDataSource } from "@/data/source.server";

export default async function Page() {
  const services = await getServerDataSource().listServices();
  const platformServices = services.filter((service) =>
    ["marketplace", "drip"].includes(service.slug),
  );
  return (
    <RoutePlaceholder
      title="Marketplace and Drip"
      lead="Commerce and community are distinct parts of the Offmark story."
      detail={
        platformServices.every(
          (service) => service.availability === "unconfirmed",
        )
          ? "Their availability and final packaging have not been confirmed."
          : "Displayed statuses are labelled preview data only."
      }
    />
  );
}
