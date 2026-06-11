import type { Metadata } from "next";
import "./globals.css";

const title = "Clarity Loop AI Book Studio";
const description = "Plan, write, refine, and prepare publication-ready books in one professional AI-guided studio for authors.";
const logoPath = "/branding/cl-ai-logo.png";
const socialLogoUrl = "https://raw.githubusercontent.com/Omoluabi1003/Clarity-Loop-Books/main/CL%20AI%20Logo.png";

export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s | ${title}`,
  },
  description,
  applicationName: title,
  authors: [{ name: "ETL GIS Consulting LLC" }],
  creator: "ETL GIS Consulting LLC",
  publisher: "ETL GIS Consulting LLC",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: logoPath, type: "image/png", sizes: "1024x1024" }],
    shortcut: [logoPath],
    apple: [{ url: logoPath, type: "image/png", sizes: "1024x1024" }],
  },
  openGraph: {
    title,
    description,
    siteName: title,
    type: "website",
    images: [{
      url: socialLogoUrl,
      width: 1024,
      height: 1024,
      alt: title,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [{ url: socialLogoUrl, alt: title }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
