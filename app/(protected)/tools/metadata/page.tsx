import RegisterInterest from "@/components/RegisterInterest";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
    title: `Video Metadata Analyzer | ${config.appName}`,
    description: "Inspect video tags, hidden metadata, and SEO signals to optimize your YouTube content strategy.",
    extraTags: {
        robots: { index: false, follow: false },
    },
});

export default function MetadataPage() {
    return (
        <RegisterInterest
            toolId="metadata"
            toolName="analyze video data"
            description="Inspect video tags, hidden metadata, and SEO signals to optimize your content strategy."
        />
    );
}
