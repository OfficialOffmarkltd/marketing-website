import { notFound } from "next/navigation";
import { DemoDataSource } from "@/data/demo/source";
import { BuildingPage } from "@/features/building/building-pages";

export default async function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <BuildingPage
      updates={await new DemoDataSource("success").listBuildUpdates()}
      basePath="/preview/building"
    />
  );
}
