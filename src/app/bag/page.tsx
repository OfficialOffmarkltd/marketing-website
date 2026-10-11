import type { Metadata } from "next";
import { getServerDataSource } from "@/data/source.server";
import { BagPage } from "@/features/bag/bag-page";
import { loadBagCatalogue } from "@/features/bag/data";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false, follow: false },
};

export default async function Page() {
  return <BagPage catalogue={await loadBagCatalogue(getServerDataSource())} />;
}
