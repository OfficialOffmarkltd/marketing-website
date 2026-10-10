import { notFound } from "next/navigation";
import { submissionScenario } from "@/data/demo/submission-scenarios";
import { ContactPage } from "@/features/company/company-pages";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const scenario = submissionScenario((await searchParams).scenario);
  return <ContactPage demo scenario={scenario} />;
}
