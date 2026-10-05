import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerDataSource } from "@/data/source.server";
import { loadProductData } from "@/features/collections/data";
import { ProductPage } from "@/features/collections/product-page";

type Props = { params: Promise<{ drop: string; design: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { drop, design } = await params;
  const result = await loadProductData(getServerDataSource(), drop, design);
  if (!result) return { title: "Design not found" };
  return { title: result.design.name, description: result.design.description };
}

export default async function Page({ params }: Props) {
  const { drop, design } = await params;
  const result = await loadProductData(getServerDataSource(), drop, design);
  if (!result) notFound();
  return <ProductPage {...result} />;
}
