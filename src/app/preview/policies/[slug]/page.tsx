import { notFound } from "next/navigation";
import { DemoDataSource } from "@/data/demo/source";
import { PolicyPage } from "@/features/company/company-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const policy = await new DemoDataSource("success").getPolicy(
    (await params).slug,
  );
  if (!policy) notFound();
  return <PolicyPage policy={policy} />;
}
