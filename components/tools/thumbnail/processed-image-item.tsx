"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatBytes, cn } from "@/libs/utils";
import { Download, AlertCircle, FileImage, BadgeCheck, FileText } from "lucide-react";
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
        <Card className="flex flex-row items-start gap-4 p-0 border-0 shadow-none bg-transparent">
            {/* Image Container with Compare Interaction */}
            <div
                className={cn(
                    "w-[335px] h-[189px] p-10 bg-white border border-neutral-200/50 rounded-lg flex flex-col justify-center items-center gap-2 overflow-hidden relative select-none cursor-pointer",
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
                            "w-[335px] h-[189px] object-cover",
                            status === "error" && "grayscale"
                        )}
                    />
                )}

                {/* Compare Overlay Label */}
                {status === "done" && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-[10px] font-sans font-medium rounded backdrop-blur-sm pointer-events-none transition-opacity duration-200">
                        {isComparing ? "ORIGINAL" : "PRESS TO COMPARE"}
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="flex-1 self-stretch flex flex-col justify-start items-start gap-4">
                {/* File Info */}
                <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-1">
                    {/* Title Row with Download Button */}
                    <div className="w-full flex items-center justify-between gap-2">
                        <div className="text-neutral-950 text-sm font-sans font-medium leading-relaxed break-words flex items-center gap-2">
                            {originalFile.name}

                            {/* Resolution Warning Badge */}
                            {hasResolutionWarning && status === "done" && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-normal border border-yellow-200" title="Image was upscaled to meet YouTube minimum 1280x720">
                                    <AlertCircle className="w-3 h-3" />
                                    <span className="text-[10px]">Upscaled</span>
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
                                        className="h-auto px-2.5 py-1.5 hover:bg-neutral-100 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                        <div className="text-ink-1000 text-sm font-[var(--font-be-vietnam-pro)] font-normal leading-relaxed">
                                            download
                                        </div>
                                        <div className="w-5 h-5 relative">
                                            <div className="w-[17.5px] h-[15.63px] absolute left-[1.25px] top-[1.25px] bg-ink-1000" />
                                        </div>
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
                                        <button
                                            type="button"
                                            onClick={() => handleDownload("png")}
                                            className="
                                            flex items-center justify-between
                                            w-full
                                            px-2.5 py-1.5
                                            rounded-lg
                                            text-left
                                            hover:bg-black/5
                                            transition-colors
                                        "
                                        >
                                            <span className="text-ink-1000 text-sm font-[var(--font-be-vietnam-pro)] leading-[23.8px]">
                                                png
                                            </span>

                                            <FileImage
                                                className="w-5 h-5 text-ink-1000"
                                                strokeWidth={1.5}
                                            />
                                        </button>

                                        {/* JPEG */}
                                        <button
                                            type="button"
                                            onClick={() => handleDownload("jpg")}
                                            className="
                                            flex items-center justify-between
                                            w-full
                                            px-2.5 py-1.5
                                            rounded-lg
                                            text-left
                                            hover:bg-black/5
                                            transition-colors
                                        "
                                        >
                                            <span className="text-ink-1000 text-sm font-[var(--font-be-vietnam-pro)] leading-[23.8px]">
                                                jpeg
                                            </span>

                                            <FileText
                                                className="w-5 h-5 text-ink-1000"
                                                strokeWidth={1.5}
                                            />
                                        </button>
                                    </div>
                                </PopoverContent>

                            </Popover>
                        ) : status === "processing" ? (
                            <div className="text-neutral-600 text-sm font-sans font-light">Processing...</div>
                        ) : null}
                    </div>

                    {/* Compression Stats and File Size Row */}
                    {status === "done" && stats ? (
                        <div className="w-full">
                            <span className="text-ink-800 text-sm font-[var(--font-be-vietnam-pro)] font-light leading-relaxed">
                                {stats.percent.toLowerCase()}
                            </span>
                            <span className="text-ink-500 text-sm font-[var(--font-be-vietnam-pro)] font-light leading-relaxed"> | </span>
                            <span className="text-ink-800 text-sm font-[var(--font-be-vietnam-pro)] font-light leading-relaxed">
                                file size {stats.compStr.toLowerCase()}
                            </span>
                        </div>
                    ) : status === "error" ? (
                        <div className="w-full">
                            <span className="text-[#B81616] text-sm font-[var(--font-be-vietnam-pro)] font-normal leading-relaxed">error</span>
                            <span className="mx-4 text-ink-500 text-sm font-[var(--font-be-vietnam-pro)] font-light leading-relaxed">|</span>
                            <span className="text-[#B81616] text-sm font-[var(--font-be-vietnam-pro)] font-light leading-relaxed">{errorMsg}</span>
                        </div>
                    ) : (
                        <div className="text-neutral-600 text-sm font-sans font-light">Optimizing...</div>
                    )}
                </div>
            </div>
        </Card>
    );
}
