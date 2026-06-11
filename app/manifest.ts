import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clarity Loop AI Book Studio",
    short_name: "Clarity Loop",
    description: "Plan, write, refine, and prepare publication-ready books in one professional AI-guided studio for authors.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf6",
    theme_color: "#181613",
    icons: [
      {
        src: "/branding/cl-ai-logo.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
