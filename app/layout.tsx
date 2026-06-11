import type { Metadata, Viewport } from "next";
import { PWARegistration } from "@/components/PWARegistration";
import "./globals.css";

const siteUrl = "https://clarity-loop-books.vercel.app";
const socialImageUrl = `${siteUrl}/clarity-loop-og.png`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#101d35",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Clarity Loop AI Book Studio",
  description: "Turn your idea into a professional, downloadable book.",
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
    icon: [
      { url: `${siteUrl}/favicon.ico`, sizes: "48x48", type: "image/x-icon" },
      { url: `${siteUrl}/icon.png`, sizes: "512x512", type: "image/png" },
    ],
    shortcut: [`${siteUrl}/favicon.ico`],
    apple: [{ url: `${siteUrl}/apple-icon.png`, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    title: "Clarity Loop AI Book Studio",
    description: "Turn your idea into a professional, downloadable book.",
    url: siteUrl,
    siteName: "Clarity Loop AI Book Studio",
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: "Clarity Loop AI Book Studio",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clarity Loop AI Book Studio",
    description: "Turn your idea into a professional, downloadable book.",
    images: [{ url: socialImageUrl, alt: "Clarity Loop AI Book Studio" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<PWARegistration /></body></html>;
}
