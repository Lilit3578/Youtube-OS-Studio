import { ReactNode } from "react";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
    title: `Comment Explorer | ${config.appName}`,
    description: "Explore, filter, and export YouTube video comments. Categorize by questions, requests, and feedback.",
    extraTags: {
        robots: { index: false, follow: false },
    },
});

export default function CommentsLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
