import type { MetadataRoute } from "next";
import config from "@/config";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/dashboard/", "/tools/", "/api/"],
        },
        sitemap: `https://${config.domainName}/sitemap.xml`,
    };
}
