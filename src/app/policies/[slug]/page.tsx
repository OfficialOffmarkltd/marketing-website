import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerDataSource } from "@/data/source.server";
import { PolicyPage } from "@/features/company/company-pages";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const policy = await getServerDataSource().getPolicy((await params).slug);
  return policy ? { title: policy.title } : { title: "Policy not found" };
}

export default async function Page({ params }: Props) {
  const policy = await getServerDataSource().getPolicy((await params).slug);
  if (!policy) notFound();
  return <PolicyPage policy={policy} />;
}
