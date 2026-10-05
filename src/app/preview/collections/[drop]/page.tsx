import { notFound } from "next/navigation";
import { DemoDataSource } from "@/data/demo/source";
import { loadDropData } from "@/features/collections/data";
import { DropPage } from "@/features/collections/drop-page";

export default async function Page({
  params,
}: {
  params: Promise<{ drop: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const result = await loadDropData(
    new DemoDataSource("success"),
    (await params).drop,
  );
  if (!result) notFound();
  return <DropPage {...result} basePath="/preview/collections" />;
}
