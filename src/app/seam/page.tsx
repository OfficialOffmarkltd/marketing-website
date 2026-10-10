import type { Metadata } from "next";
import { getServerDataSource } from "@/data/source.server";
import { SeamPage } from "@/features/services/service-pages";

export const metadata: Metadata = {
  title: "Seam",
  description: "Discover Seam, Offmark's standalone fashion design platform.",
};

export default async function Page() {
  const seam = (await getServerDataSource().listServices()).find(
    (service) => service.slug === "seam",
  );
  return <SeamPage service={seam} />;
}
