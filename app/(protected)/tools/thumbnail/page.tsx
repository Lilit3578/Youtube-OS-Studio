import ImageCompressor from "@/components/tools/thumbnail/ImageCompressor";

export default function ThumbnailPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Thumbnail Compressor</h1>
            <ImageCompressor />
        </div>
    );
}
