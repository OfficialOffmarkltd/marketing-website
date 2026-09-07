import { ThemeProvider } from "@wrksz/themes/next";
import { Geist, Instrument_Sans } from "next/font/google";
import { metadataConfig } from "@/config/site.config";
import "./globals.css";

import { DirectionProvider } from "@/components/ui/direction";
import { cn } from "@/lib/utils";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = metadataConfig;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        "font-sans",
        instrumentSans.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          themes={["light", "dark"]}
          enableSystem={true}
          disableTransitionOnChange
        >
          <DirectionProvider direction="rtl">{children}</DirectionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
