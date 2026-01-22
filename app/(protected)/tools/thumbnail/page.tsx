import ImageCompressor from "@/components/tools/thumbnail/image-compressor";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
    title: "YouTube Thumbnail Compressor | YouTube OS Studio",
    description: "Optimize and compress your YouTube thumbnails to meet size requirements while maintaining high quality.",
    canonicalUrlRelative: "/tools/thumbnail",
});

export default function ThumbnailPage() {
    return (
        <div className="space-y-6">
            <ImageCompressor />
        </div>
    );
}
