import type { MetadataRoute } from "next";
import logo from "../CL AI Logo.png";

const logoUrl = logo.src.replaceAll(" ", "%20");

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clarity Loop AI Book Studio",
    short_name: "Clarity Loop",
    description: "A guided AI publishing studio for turning ideas into publication-ready books.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#fbfaf6",
    theme_color: "#101d35",
    categories: ["books", "productivity", "writing"],
    icons: [
      {
        src: logoUrl,
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: logoUrl,
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
