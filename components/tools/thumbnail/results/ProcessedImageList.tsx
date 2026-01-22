"use client";

import { Separator } from "@/components/ui/separator";
import ProcessedImageItem from "./ProcessedImageItem";

export interface ProcessedImageItemDetails {
    id: string;
    file: File;
    blob: Blob | null;
    status: "processing" | "done" | "error";
    errorMsg?: string;
    compressionRatio?: number;
    hasResolutionWarning?: boolean;
}

export default function ProcessedImageList({ items }: { items: ProcessedImageItemDetails[] }) {
    if (items.length === 0) return null;

    return (
        <div className="w-full flex flex-col gap-4">
            {items.map((item, index) => (
                <div key={item.id} className="flex flex-col gap-4">
                    {index > 0 && <Separator />}
                    <ProcessedImageItem
                        originalFile={item.file}
                        processedBlob={item.blob}
                        status={item.status}
                        errorMsg={item.errorMsg}
                        hasResolutionWarning={item.hasResolutionWarning}
                    />
                </div>
            ))}
        </div>
    );
}
