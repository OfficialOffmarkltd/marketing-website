import { notFound } from "next/navigation";
import { DemoDataSource } from "@/data/demo/source";
import { BagPage } from "@/features/bag/bag-page";
import { loadBagCatalogue } from "@/features/bag/data";

export default async function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <BagPage
      catalogue={await loadBagCatalogue(new DemoDataSource("success"))}
      basePath="/preview/collections"
    />
  );
}
