import type { Metadata, Viewport } from "next";
import { PWARegistration } from "@/components/PWARegistration";
import logo from "../CL AI Logo.png";

const logoUrl = logo.src.replaceAll(" ", "%20");
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#101d35",
};

export const metadata: Metadata = {
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
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<PWARegistration /></body></html>;
}
