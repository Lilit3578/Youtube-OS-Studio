"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import UploadCard from "./UploadCard";
import ProcessedImageList, { ProcessedImageItemDetails } from "./results/ProcessedImageList";
import { formatBytes } from "@/libs/utils";

// Logic moved to custom hook for better separation and real implementation
import { useThumbnailCompressor } from "@/libs/hooks/useThumbnailCompressor";

export default function ImageCompressor() {
    const { items, addFiles } = useThumbnailCompressor();

    return (
        <>
            <UploadCard onFilesSelected={addFiles} />

            {items.length > 0 && <div className="w-full border-t border-neutral-200/50" />}
            <ProcessedImageList items={items} />
        </>

    );
}
