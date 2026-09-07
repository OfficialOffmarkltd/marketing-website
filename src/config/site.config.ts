import type { Metadata } from "next";
import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "Offmark",
  title: "Offmark | Web infra",
  description: "Write high performant copy backed by data",
  origin: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  keywords: ["Next.js 16", "Shadcn UI", "TypeScript", "Website Template"],
  og: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/og.png`,
  socials: {
    github: "#",
    x: "",
  },
};

export const metadataConfig: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  creator: siteConfig.name,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.origin,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.og,
        width: 2880,
        height: 1800,
        alt: siteConfig.name,
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.socials.x,
    title: siteConfig.title,
    description: siteConfig.description,
    images: {
      url: siteConfig.og,
      width: 2880,
      height: 1800,
      alt: siteConfig.name,
    },
  },
};
