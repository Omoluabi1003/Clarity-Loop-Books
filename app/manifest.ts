import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clarity Loop AI Book Studio",
    short_name: "Clarity Loop",
    description: "A premium AI publishing studio that turns ideas into publication-ready books.",
    start_url: "/",
    display: "standalone",
    background_color: "#07111f",
    theme_color: "#101d35",
    orientation: "any",
    icons: [
      { src: "/assets/branding/clarity-loop-logo.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
      { src: "/assets/branding/clarity-loop-logo.png", sizes: "1024x1024", type: "image/png", purpose: "maskable" },
    ],
  };
}
