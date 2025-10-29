import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://ultimatemarketingsmash.com";
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/development`, changeFrequency: "monthly" },
    { url: `${base}/marketing`, changeFrequency: "monthly" },
    { url: `${base}/work`, changeFrequency: "monthly" },
    { url: `${base}/about`, changeFrequency: "yearly" },
    { url: `${base}/contact`, changeFrequency: "yearly" },
  ];
}
