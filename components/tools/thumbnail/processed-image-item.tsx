"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatBytes, cn } from "@/libs/utils";
import { Download, FileImage, FileText, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface ProcessedImageItemProps {
    originalFile: File;
    processedBlob: Blob | null;
    status: "processing" | "done" | "error";
    errorMsg?: string;
    hasResolutionWarning?: boolean;
}

export default function ProcessedImageItem({
    originalFile,
    processedBlob,
    status,
    errorMsg,
    hasResolutionWarning
}: ProcessedImageItemProps) {
    // 1. Manage Object URLs
    const [originalUrl, setOriginalUrl] = React.useState<string | null>(null);
    const [processedUrl, setProcessedUrl] = React.useState<string | null>(null);
    const [isComparing, setIsComparing] = React.useState(false);

    React.useEffect(() => {
        const url = URL.createObjectURL(originalFile);
        setOriginalUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [originalFile]);

    React.useEffect(() => {
        if (processedBlob) {
            const url = URL.createObjectURL(processedBlob);
            setProcessedUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setProcessedUrl(null);
    }, [processedBlob]);

    // Active URL based on state
    // If comparing -> show original
    // If not comparing and we have processed version -> show processed
    // Fallback -> show original (e.g. while processing)
    const activeUrl = isComparing ? originalUrl : (processedUrl || originalUrl);

    // 2. Real math calculation
    const stats = useMemo(() => {
        if (!processedBlob || status !== "done") return null;

        const orig = originalFile.size;
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
    const handleDownload = (format: "png" | "jpg") => {
        if (!processedBlob) return;

        const nameWithoutExt = originalFile.name.substring(0, originalFile.name.lastIndexOf(".")) || originalFile.name;
        const extension = format === "png" ? ".png" : ".jpg";
        const fullFilename = `${nameWithoutExt}-optimized${extension}`;

        const url = URL.createObjectURL(processedBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fullFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Card className="flex flex-row items-start gap-8 p-0 border-0 shadow-none bg-transparent w-full">
            {/* Image Container with Compare Interaction */}
            <div
                className={cn(
                    "w-[335px] aspect-video bg-white border border-neutral-200 rounded-xl flex flex-col justify-center items-center overflow-hidden relative select-none cursor-pointer",
                    status === "error" && "opacity-50"
                )}
                onMouseDown={() => status === "done" && setIsComparing(true)}
                onMouseUp={() => setIsComparing(false)}
                onMouseLeave={() => setIsComparing(false)}
                onTouchStart={() => status === "done" && setIsComparing(true)}
                onTouchEnd={() => setIsComparing(false)}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {activeUrl && (
                    <img
                        src={activeUrl}
                        alt={originalFile.name}
                        className={cn(
                            "w-full h-full object-cover",
                            status === "error" && "grayscale"
                        )}
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
                        <div className="body font-medium text-neutral-950 leading-relaxed break-all flex items-center gap-2">
                            {originalFile.name}

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
                                        className="h-auto px-0 hover:bg-transparent flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                        <div className="body text-neutral-950 leading-relaxed">
                                            download
                                        </div>
                                        <Download size={20} weight="regular" className="text-neutral-950" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    align="end"
                                    sideOffset={6}
                                    className="
                                        w-[180px]
                                        p-2
                                        bg-white
                                        rounded-xl
                                        shadow-lg
                                        border border-black/5
                                    "
                                >
                                    <div className="flex flex-col gap-1">
                                        {/* PNG */}
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDownload("png")}
                                            className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg h-auto hover:bg-black/5"
                                        >
                                            <span className="body text-neutral-950 leading-relaxed">
                                                png
                                            </span>

                                            <FileImage
                                                size={20}
                                                weight="regular"
                                                className="text-neutral-950"
                                            />
                                        </Button>

                                        {/* JPEG */}
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDownload("jpg")}
                                            className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg h-auto hover:bg-black/5"
                                        >
                                            <span className="body text-neutral-950 leading-relaxed">
                                                jpeg
                                            </span>

                                            <FileText
                                                size={20}
                                                weight="regular"
                                                className="text-neutral-950"
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
                            <span className="body text-neutral-400 leading-relaxed">
                                {stats.percent.toLowerCase()}
                            </span>
                            <div className="w-px h-3 bg-neutral-200" />
                            <span className="body text-neutral-400 leading-relaxed">
                                file size {formatBytes(processedBlob?.size || 0).toLowerCase()}
                            </span>
                        </div>
                    ) : status === "error" ? (
                        <div className="flex items-center gap-3">
                            <span className="body font-medium text-[#C03535] leading-relaxed">error</span>
                            <div className="w-px h-3 bg-neutral-200" />
                            <span className="body text-[#C03535] leading-relaxed opacity-80">{errorMsg}</span>
                        </div>
                    ) : (
                        <div className="body text-neutral-400 italic">Optimizing...</div>
                    )}
                </div>

                {/* Status indicator for active processing (if needed) */}
                {status === "processing" && (
                    <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-neutral-950 animate-shimmer w-1/3" />
                    </div>
                )}
            </div>
        </Card>
    );
}
