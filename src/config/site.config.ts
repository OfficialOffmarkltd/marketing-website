import type { Metadata } from "next";
import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "Offmark",
  title: "Offmark | Fashion. On your terms.",
  description:
    "Offmark is a Nigerian fashion and technology company connecting original collections, fashion design and creative community.",
  origin: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
};

export const metadataConfig: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: {
    default: siteConfig.title,
    template: "%s · Offmark",
  },
  description: siteConfig.description,
  // Foundation preview: remove only when approved public content is ready.
  robots: { index: false, follow: false },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};
