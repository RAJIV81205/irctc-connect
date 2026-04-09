import type { MetadataRoute } from "next";
import { getSiteUrl } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/" , "/pricing" , "/docs" , "/api/user/verify"],
        disallow: ["/dashboard", "/auth", "/admin", "/api/admin" , "/api/user"],
      },
    ],
    sitemap: [`${siteUrl}/sitemap.xml`],
    host: siteUrl,
  };
}
