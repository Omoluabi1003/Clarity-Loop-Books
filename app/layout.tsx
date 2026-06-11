import type { Metadata, Viewport } from "next";
import { PWARegistration } from "@/components/PWARegistration";
import logo from "../CL AI Logo.png";

const logoUrl = logo.src.replaceAll(" ", "%20");
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#101d35",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Clarity Loop AI Book Studio",
  description: "A premium AI publishing platform that turns ideas into publication-ready books.",
  applicationName: "Clarity Loop AI Book Studio",
  authors: [{ name: "ETL GIS Consulting LLC" }],
  creator: "ETL GIS Consulting LLC",
  publisher: "ETL GIS Consulting LLC",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Clarity Loop",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: logoUrl, sizes: "1024x1024", type: "image/png" }],
    apple: [{ url: logoUrl, sizes: "1024x1024", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    title: "Clarity Loop AI Book Studio",
    description: "A premium AI publishing platform that turns ideas into publication-ready books.",
    siteName: "Clarity Loop AI Book Studio",
    images: [{
      url: logoUrl,
      width: 1024,
      height: 1024,
      alt: "Clarity Loop AI Book Studio logo",
      type: "image/png",
    }],
  },
  twitter: {
    card: "summary",
    title: "Clarity Loop AI Book Studio",
    description: "A premium AI publishing platform that turns ideas into publication-ready books.",
    images: [{ url: logoUrl, alt: "Clarity Loop AI Book Studio logo" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<PWARegistration /></body></html>;
}
