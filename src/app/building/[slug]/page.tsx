import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerDataSource } from "@/data/source.server";
import { BuildingDetailPage } from "@/features/building/building-pages";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const update = await getServerDataSource().getBuildUpdate(
    (await params).slug,
  );
  return update
    ? { title: update.title, description: update.summary }
    : { title: "Update not found" };
}

export default async function Page({ params }: Props) {
  const update = await getServerDataSource().getBuildUpdate(
    (await params).slug,
  );
  if (!update) notFound();
  return <BuildingDetailPage update={update} />;
}
