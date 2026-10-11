import { Inter, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { SiteShell } from "@/components/layout/site-shell";
import { DirectionProvider } from "@/components/ui/direction";
import { metadataConfig } from "@/config/site.config";
import { BagProvider } from "@/features/bag/bag-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const metadata = metadataConfig;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body>
        <DirectionProvider direction="ltr">
          <BagProvider>
            <SiteShell footer={<Footer />}>{children}</SiteShell>
          </BagProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
