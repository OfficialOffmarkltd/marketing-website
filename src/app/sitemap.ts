import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.origin;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
  ];
}
