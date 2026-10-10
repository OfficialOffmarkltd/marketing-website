import type { Metadata } from "next";
import { getServerDataSource } from "@/data/source.server";
import { BuildingPage } from "@/features/building/building-pages";

export const metadata: Metadata = {
  title: "Building Offmark",
  description: "Follow dated, evidence-backed Offmark product updates.",
};

export default async function Page() {
  const updates = await getServerDataSource().listBuildUpdates();
  return <BuildingPage updates={updates} />;
}
