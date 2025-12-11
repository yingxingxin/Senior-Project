import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://trysprite.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup", "/courses", "/quizzes", "/leaderboard"],
        disallow: [
          "/home",
          "/settings",
          "/settings/*",
          "/friends",
          "/friends/*",
          "/study",
          "/study/*",
          "/editor",
          "/editor/*",
          "/explore",
          "/explore/*",
          "/u/*",
          "/onboarding",
          "/onboarding/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
