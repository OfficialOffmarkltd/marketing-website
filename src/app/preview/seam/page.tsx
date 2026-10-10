import { notFound } from "next/navigation";
import { DemoDataSource } from "@/data/demo/source";
import { submissionScenario } from "@/data/demo/submission-scenarios";
import { SeamPage } from "@/features/services/service-pages";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const service = (await new DemoDataSource("success").listServices()).find(
    (item) => item.slug === "seam",
  );
  return (
    <SeamPage
      service={service}
      scenario={submissionScenario((await searchParams).scenario)}
    />
  );
}
