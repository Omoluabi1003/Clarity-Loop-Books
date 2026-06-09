import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clarity Loop AI Book Studio | From Idea to Finished Manuscript",
  description: "A premium, guided AI Book Studio for turning an idea into a blueprint, complete manuscript, and export-ready book. Developed by ETL GIS Consulting LLC.",
  applicationName: "Clarity Loop AI Book Studio",
  authors: [{ name: "ETL GIS Consulting LLC" }],
  creator: "ETL GIS Consulting LLC",
  publisher: "ETL GIS Consulting LLC",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
