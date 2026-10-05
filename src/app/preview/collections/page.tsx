import { notFound } from "next/navigation";
import { DemoDataSource } from "@/data/demo/source";
import { CollectionsPage } from "@/features/collections/collections-page";
import { loadCollectionsData } from "@/features/collections/data";

export default async function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <CollectionsPage
      items={await loadCollectionsData(new DemoDataSource("success"))}
      basePath="/preview/collections"
    />
  );
}
