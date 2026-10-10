import { notFound } from "next/navigation";
import { DemoDataSource } from "@/data/demo/source";
import { submissionScenario } from "@/data/demo/submission-scenarios";
import { PlatformPage } from "@/features/services/service-pages";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <PlatformPage
      services={await new DemoDataSource("success").listServices()}
      scenario={submissionScenario((await searchParams).scenario)}
    />
  );
}
