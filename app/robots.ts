import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.hospital.in";

  return {
    rules: { 
      userAgent: "*", 
      allow: "/",
      disallow: ["/api", "/admin", "/dashboard", "/setup-password", "/onboarding"]
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
