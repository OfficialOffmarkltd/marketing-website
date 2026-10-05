import type { Metadata } from "next";
import { getServerDataSource } from "@/data/source.server";
import { CollectionsPage } from "@/features/collections/collections-page";
import { loadCollectionsData } from "@/features/collections/data";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore active Offmark preorder drops and the collection archive.",
};

export default async function Page() {
  return (
    <CollectionsPage items={await loadCollectionsData(getServerDataSource())} />
  );
}
