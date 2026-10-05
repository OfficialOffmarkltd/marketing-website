import { notFound } from "next/navigation";
import { DemoDataSource } from "@/data/demo/source";
import { loadHomepageData } from "@/features/home/data";
import { Homepage } from "@/features/home/homepage";

export default async function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <Homepage {...(await loadHomepageData(new DemoDataSource("success")))} />
  );
}
