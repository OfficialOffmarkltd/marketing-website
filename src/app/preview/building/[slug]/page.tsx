import { notFound } from "next/navigation";
import { DemoDataSource } from "@/data/demo/source";
import { BuildingDetailPage } from "@/features/building/building-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const update = await new DemoDataSource("success").getBuildUpdate(
    (await params).slug,
  );
  if (!update) notFound();
  return <BuildingDetailPage update={update} />;
}
