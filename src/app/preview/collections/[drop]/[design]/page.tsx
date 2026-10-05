import { notFound } from "next/navigation";
import { DemoDataSource } from "@/data/demo/source";
import { loadProductData } from "@/features/collections/data";
import { ProductPage } from "@/features/collections/product-page";

export default async function Page({
  params,
}: {
  params: Promise<{ drop: string; design: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { drop, design } = await params;
  const result = await loadProductData(
    new DemoDataSource("success"),
    drop,
    design,
  );
  if (!result) notFound();
  return <ProductPage {...result} basePath="/preview/collections" />;
}
