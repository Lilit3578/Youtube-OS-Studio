"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatBytes } from "@/libs/utils";
import { Download, AlertCircle, FileImage, BadgeCheck } from "lucide-react";
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
                className="w-[335px] h-[189px] p-10 bg-white border border-neutral-200/50 rounded-lg flex flex-col justify-center items-center gap-2 overflow-hidden relative select-none cursor-pointer"
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
                        className="w-[335px] h-[189px] object-cover"
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
                    <div className="text-neutral-950 text-sm font-sans font-medium leading-relaxed break-words flex items-center gap-2">
                        {originalFile.name}  |  {stats ? stats.compStr : formatBytes(originalFile.size)}

                        {/* Resolution Warning Badge */}
                        {hasResolutionWarning && status === "done" && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 textxs rounded-full font-normal border border-yellow-200" title="Image was upscaled to meet YouTube minimum 1280x720">
                                <AlertCircle className="w-3 h-3" />
                                <span className="text-[10px]">Upscaled</span>
                            </span>
                        )}
                    </div>
                    <div className="self-stretch text-neutral-600 text-sm font-sans font-light leading-relaxed break-words">
                        Original file size: {formatBytes(originalFile.size)}
                    </div>
                </div>

                {/* Actions & Status */}
                <div className="self-stretch flex justify-between items-center">
                    {status === "done" ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    className="h-10 px-6 bg-neutral-950 hover:bg-neutral-800 rounded-full flex justify-center items-center gap-2 cursor-pointer transition-all"
                                >
                                    <div className="w-4 h-4 relative overflow-hidden">
                                        <div className="w-[9.33px] h-3 absolute left-[3.33px] top-0.5 border-[1.33px] border-white" />
                                    </div>
                                    <div className="text-white text-xs font-mono font-medium uppercase leading-4 break-words">
                                        download
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-48 p-1">
                                <div className="grid gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start gap-2 cursor-pointer font-normal font-sans"
                                        onClick={() => handleDownload("jpg")}
                                    >
                                        <FileImage className="w-4 h-4 text-muted-foreground" />
                                        Download as JPG
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start gap-2 cursor-pointer font-normal font-sans"
                                        onClick={() => handleDownload("png")}
                                    >
                                        <FileImage className="w-4 h-4 text-muted-foreground" />
                                        Download as PNG
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <Button disabled className="h-10 px-6 bg-neutral-200 text-neutral-400 rounded-full flex justify-center items-center gap-2 cursor-not-allowed">
                            {status === "processing" ? "Processing..." : "Error"}
                        </Button>
                    )}

                    {/* Stats or Status Text */}
                    <div className="flex-1 text-right text-neutral-950 text-sm font-sans font-medium leading-relaxed break-words">
                        {status === "done" && stats && stats.percent}
                        {status === "processing" && "Optimizing..."}
                        {status === "error" && <span className="text-destructive">{errorMsg}</span>}
                    </div>
                </div>
            </div>
        </Card>
    );
}
