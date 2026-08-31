import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.hospital.in";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Core pages ──────────────────────────────────────────
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pricing`, changeFrequency: "weekly", priority: 0.9 },
    
    // ── Auth pages ──────────────────────────────────────────
    { url: `${BASE_URL}/login`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/register`, changeFrequency: "yearly", priority: 0.5 },
    
    // ── Blog posts ──────────────────────────────────────────
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
  ];
}
