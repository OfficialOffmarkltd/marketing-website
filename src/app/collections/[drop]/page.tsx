import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerDataSource } from "@/data/source.server";
import { loadDropData } from "@/features/collections/data";
import { DropPage } from "@/features/collections/drop-page";

type Props = { params: Promise<{ drop: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await loadDropData(getServerDataSource(), (await params).drop);
  if (!result) return { title: "Collection not found" };
  return { title: result.drop.name, description: result.drop.story };
}

export default async function Page({ params }: Props) {
  const result = await loadDropData(getServerDataSource(), (await params).drop);
  if (!result) notFound();
  return <DropPage {...result} />;
}
