import type { Metadata } from "next";
import { AboutPage } from "@/features/company/company-pages";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Offmark, a Nigerian fashion and technology company.",
};

export default function Page() {
  return <AboutPage />;
}
