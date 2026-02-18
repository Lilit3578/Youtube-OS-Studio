"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatBytes, cn } from "@/libs/utils";
import { FileImage, FileText, WarningCircle } from "@phosphor-icons/react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface ProcessedImageItemProps {
    originalFile: File; // The truly original uploaded file
    processedFile: File; // The processed/cropped file
    processedBlob: Blob | null;
    status: "processing" | "done" | "error";
    errorMsg?: string;
    hasResolutionWarning?: boolean;
}

export default function ProcessedImageItem({
    originalFile,
    processedFile,
    processedBlob,
    status,
    errorMsg,
    hasResolutionWarning
}: ProcessedImageItemProps) {
    // 1. Manage State
    const [isComparing, setIsComparing] = React.useState(false);

    // Active URL based on state (HIGH-02 Fix: Consolidated URL logic)
    const [activeUrl, setActiveUrl] = React.useState<string | null>(null);

    // Single Effect to manage the Display URL
    // This prevents multiple URL creations and ensures strict cleanup
    React.useEffect(() => {
        let url: string | null = null;

        if (isComparing) {
            // Show Original
            url = URL.createObjectURL(originalFile);
        } else if (processedBlob && status === "done") {
            // Show Processed
            url = URL.createObjectURL(processedBlob);
        } else {
            // Fallback to Original (e.g. processing)
            url = URL.createObjectURL(originalFile);
        }

        setActiveUrl(url);

        // Strict Cleanup
        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [originalFile, processedBlob, status, isComparing]);

    // 2. Real math calculation
    // NOTE: We compare against `originalFile.size` (the user's actual upload),
    // NOT `processedFile.size` (the canvas-resized PNG intermediate which is
    // always larger than the source JPEG and would produce incorrect +0% results).
    const stats = useMemo(() => {
        if (!processedBlob || status !== "done") return null;

        const orig = originalFile.size; // ← user's original upload
        const comp = processedBlob.size;
        const savingsBytes = orig - comp;
        const savingsPercent = Math.round((savingsBytes / orig) * 100);

        return {
            origStr: formatBytes(orig),
            compStr: formatBytes(comp),
            percent: savingsPercent > 0 ? `-${savingsPercent}% Compression` : `+${Math.abs(savingsPercent)}% Size Increase`,
            isSavings: savingsPercent > 0
        };
    }, [originalFile, processedBlob, status]);

    // 3. Download Handler
    // Re-encodes to the correct format via canvas to avoid mislabeled files
    // (e.g. a JPEG blob saved with a .png extension would be a broken file).
    const handleDownload = (format: "png" | "jpg") => {
        if (!processedBlob) return;

        const nameWithoutExt = processedFile.name.substring(0, processedFile.name.lastIndexOf(".")) || processedFile.name;
        const extension = format === "png" ? ".png" : ".jpg";
        const fullFilename = `${nameWithoutExt}-optimized${extension}`;
        const mimeType = format === "png" ? "image/png" : "image/jpeg";

        // If the blob is already the right type, download directly
        if (processedBlob.type === mimeType) {
            const url = URL.createObjectURL(processedBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fullFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return;
        }

        // Re-encode via canvas to produce the correct format
        const img = new window.Image();
        const srcUrl = URL.createObjectURL(processedBlob);
        img.onload = () => {
            URL.revokeObjectURL(srcUrl);
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fullFilename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, mimeType, format === "jpg" ? 0.92 : undefined);
        };
        img.onerror = () => URL.revokeObjectURL(srcUrl);
        img.src = srcUrl;
    };

    return (
        <div className="flex flex-row items-start gap-[16px] w-full">
            {/* Image Container with Compare Interaction */}
            <div
                className={cn(
                    "w-[248px] h-[140px] bg-ink-0 border-2 border-solid rounded-[8px] flex flex-col justify-center items-center overflow-hidden relative select-none cursor-pointer transition-all duration-200",
                    status === "error" && "opacity-50",
                    isComparing ? "border-primary" : "border-ink-300"
                )}
                onMouseDown={(e) => {
                    e.preventDefault();
                    if (status === "done") setIsComparing(true);
                }}
                onMouseUp={(e) => {
                    e.preventDefault();
                    setIsComparing(false);
                }}
                onMouseLeave={(e) => {
                    e.preventDefault();
                    setIsComparing(false);
                }}
                onTouchStart={(e) => {
                    e.preventDefault();
                    if (status === "done") setIsComparing(true);
                }}
                onTouchEnd={(e) => {
                    e.preventDefault();
                    setIsComparing(false);
                }}
            >
                {activeUrl && (
                    <Image
                        key={isComparing ? 'original' : 'processed'}
                        src={activeUrl}
                        alt={processedFile.name}
                        fill
                        unoptimized
                        className={cn(
                            "transition-opacity duration-200",
                            // Use object-contain for original to show full image, object-cover for processed to fill frame
                            isComparing ? "object-contain" : "object-cover",
                            status === "error" && "grayscale"
                        )}
                        draggable={false}
                    />
                )}

                {/* Compare Overlay Label */}
                {status === "done" && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 text-white text-[10px] font-[var(--font-be-vietnam-pro)] font-medium rounded backdrop-blur-sm pointer-events-none transition-opacity duration-200 uppercase tracking-wider">
                        {isComparing ? "Original" : "Press to compare"}
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="flex-1 self-stretch flex flex-col justify-between py-1">
                {/* File Info */}
                <div className="flex flex-col gap-1.5">
                    {/* Title Row with Download Button */}
                    <div className="w-full flex items-center justify-between gap-2">
                        <div className="body-strong text-foreground break-all flex items-center gap-2">
                            {processedFile.name}

                            {/* Resolution Warning Badge */}
                            {hasResolutionWarning && status === "done" && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] rounded-full font-normal border border-yellow-200" title="Image was upscaled to meet YouTube minimum 1280x720">
                                    <WarningCircle size={12} weight="fill" />
                                    <span>Upscaled</span>
                                </span>
                            )}
                        </div>

                        {/* Download Button (Ghost) */}
                        {status === "done" ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto px-0 hover:bg-transparent flex items-center gap-2 cursor-pointer transition-colors !normal-case"
                                    >
                                        <p className="body text-foreground">
                                            download
                                        </p>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    align="end"
                                    sideOffset={6}
                                    className="
                                        w-[160px]
                                        p-[8px]
                                        bg-popover
                                        rounded-[12px]
                                        shadow-lg
                                        border border-ink-300
                                    "
                                >
                                    <div className="flex flex-col gap-1">
                                        {/* PNG */}
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDownload("png")}
                                            className="flex items-center justify-between w-full px-[10px] py-[6px] rounded-[8px] h-auto cursor-pointer"
                                        >
                                            <span className="body text-foreground">
                                                png
                                            </span>

                                            <FileImage
                                                size={20}
                                                weight="regular"
                                                className="text-foreground"
                                            />
                                        </Button>

                                        {/* JPEG */}
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDownload("jpg")}
                                            className="flex items-center justify-between w-full px-[10px] py-[6px] rounded-[8px] h-auto cursor-pointer"
                                        >
                                            <span className="body text-foreground">
                                                jpeg
                                            </span>

                                            <FileText
                                                size={20}
                                                weight="regular"
                                                className="text-foreground"
                                            />
                                        </Button>
                                    </div>
                                </PopoverContent>

                            </Popover>
                        ) : status === "processing" ? (
                            <div className="body text-neutral-400">Processing...</div>
                        ) : null}
                    </div>

                    {/* Compression Stats and File Size Row */}
                    {status === "done" && stats ? (
                        <div className="flex items-center gap-3">
                            <span className="body text-muted-foreground">
                                {stats.percent.toLowerCase()}
                            </span>
                            <div className="w-px h-3 bg-border" />
                            <span className="body text-muted-foreground">
                                file size {formatBytes(processedBlob?.size || 0).toLowerCase()}
                            </span>
                        </div>
                    ) : status === "error" ? (
                        <div className="flex items-center gap-3">
                            <span className="body font-medium text-destructive">error</span>
                            <div className="w-px h-3 bg-border" />
                            <span className="body text-destructive opacity-80">{errorMsg}</span>
                        </div>
                    ) : (
                        <div className="body text-muted-foreground italic">Optimizing...</div>
                    )}
                </div>

                {/* Status indicator for active processing (if needed) */}
                {status === "processing" && (
                    <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-neutral-950 animate-shimmer w-1/3" />
                    </div>
                )}
            </div>
        </div>
    );
}
