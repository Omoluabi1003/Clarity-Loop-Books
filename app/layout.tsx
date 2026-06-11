import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteName = "Clarity Loop AI Book Studio";
const description = "A premium AI publishing studio that turns your idea into a structured, publication-ready book.";
const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://clarityloop.ai");

export const metadata: Metadata = {
  metadataBase,
  title: { default: siteName, template: `%s | ${siteName}` },
  description,
  applicationName: siteName,
  authors: [{ name: "ETL GIS Consulting LLC" }],
  creator: "ETL GIS Consulting LLC",
  publisher: "ETL GIS Consulting LLC",
  category: "Publishing",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/assets/branding/clarity-loop-logo.png", type: "image/png", sizes: "1024x1024" }],
    apple: [{ url: "/assets/branding/clarity-loop-logo.png", type: "image/png", sizes: "1024x1024" }],
    shortcut: "/assets/branding/clarity-loop-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName,
    title: siteName,
    description,
    images: [{ url: "/assets/branding/clarity-loop-logo.png", width: 1024, height: 1024, alt: `${siteName} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
    images: ["/assets/branding/clarity-loop-logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#101d35",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
