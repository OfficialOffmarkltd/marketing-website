import type { Metadata } from "next";
import { getServerDataSource } from "@/data/source.server";
import { PlatformPage } from "@/features/services/service-pages";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "Explore Offmark's Marketplace commerce service and Drip fashion community.",
};

export default async function Page() {
  const services = await getServerDataSource().listServices();
  return (
    <PlatformPage
      services={services.filter((service) =>
        ["marketplace", "drip"].includes(service.slug),
      )}
    />
  );
}
