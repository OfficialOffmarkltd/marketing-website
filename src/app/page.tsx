import { getServerDataSource } from "@/data/source.server";
import { loadHomepageData } from "@/features/home/data";
import { Homepage } from "@/features/home/homepage";

export default async function Home() {
  return <Homepage {...(await loadHomepageData(getServerDataSource()))} />;
}
