"use client";

import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/libs/utils";
import toast from "react-hot-toast";
import { FileImage, FileText, Download } from "lucide-react";


// Internal 
import { useThumbnailCompressor } from "@/libs/hooks/useThumbnailCompressor";
import ProcessedImageItem from "./processed-image-item";
import { THUMBNAIL_CONFIG } from "@/libs/thumbnail-utils";
import { formatBytes } from "@/libs/utils";

export default function ImageCompressor() {
    const { items, addFiles } = useThumbnailCompressor();
    const [isDragging, setIsDragging] = useState(false);

    // --- Upload Logic (Inlined) ---
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const validateFile = (file: File): boolean => {
        const validTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            toast.error("Unsupported file format. Only JPG and PNG images are supported.");
            return false;
        }
        const MAX_SIZE = THUMBNAIL_CONFIG.UPLOAD_MAX_SIZE_BYTES;
        if (file.size > MAX_SIZE) {
            toast.error(`This image is too large. Please upload a file smaller than ${formatBytes(MAX_SIZE)}.`);
            return false;
        }
        return true;
    };

    const onFilesSelected = (files: File[]) => {
        const validFiles = files.filter(validateFile);
        if (validFiles.length > 0) {
            addFiles(validFiles);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(Array.from(e.dataTransfer.files));
        }
    }, [addFiles]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(Array.from(e.target.files));
        }
    }, [addFiles]);

    const handleDownloadAll = async (format: "png" | "jpg") => {
        const completedItems = items.filter(item => item.status === "done" && item.blob);
        if (completedItems.length === 0) return;

        try {
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();

            completedItems.forEach((item) => {
                if (item.blob) {
                    const nameWithoutExt = item.file.name.substring(0, item.file.name.lastIndexOf(".")) || item.file.name;
                    const extension = format === "png" ? ".png" : ".jpg";
                    const fullFilename = `${nameWithoutExt}-optimized${extension}`;
                    zip.file(fullFilename, item.blob);
                }
            });

            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = `compressed-thumbnails-${format}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("All images downloaded!");
        } catch (error) {
            console.error("Failed to create zip:", error);
            toast.error("Failed to make zip file.");
        }
    };

    const completedCount = items.filter(i => i.status === "done").length;

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            {/* Upload Zone */}
            <Card
                className={cn(
                    "w-full p-10 bg-neutral-50/50 border border-dashed border-neutral-200 rounded-lg flex flex-col justify-center items-center gap-4 transition-colors duration-200 cursor-pointer hover:bg-neutral-100",
                    isDragging ? "border-primary bg-neutral-100" : ""
                )}
                style={{ outlineOffset: "-1px" }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("thumbnail-upload-input")?.click()}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="14" viewBox="0 0 17 14" fill="none">
                    <path d="M15 0H1.25C0.918479 0 0.600537 0.131696 0.366116 0.366116C0.131696 0.600537 0 0.918479 0 1.25V12.5C0 12.8315 0.131696 13.1495 0.366116 13.3839C0.600537 13.6183 0.918479 13.75 1.25 13.75H15C15.3315 13.75 15.6495 13.6183 15.8839 13.3839C16.1183 13.1495 16.25 12.8315 16.25 12.5V1.25C16.25 0.918479 16.1183 0.600537 15.8839 0.366116C15.6495 0.131696 15.3315 0 15 0ZM15 1.25V9.27734L12.9633 7.24141C12.8472 7.1253 12.7094 7.0332 12.5577 6.97037C12.406 6.90753 12.2435 6.87519 12.0793 6.87519C11.9151 6.87519 11.7526 6.90753 11.6009 6.97037C11.4492 7.0332 11.3114 7.1253 11.1953 7.24141L9.63281 8.80391L6.19531 5.36641C5.96092 5.13216 5.6431 5.00058 5.31172 5.00058C4.98034 5.00058 4.66252 5.13216 4.42813 5.36641L1.25 8.54453V1.25H15ZM1.25 10.3125L5.3125 6.25L11.5625 12.5H1.25V10.3125ZM15 12.5H13.3305L10.518 9.6875L12.0805 8.125L15 11.0453V12.5ZM9.375 4.6875C9.375 4.50208 9.42998 4.32082 9.533 4.16665C9.63601 4.01248 9.78243 3.89232 9.95373 3.82136C10.125 3.75041 10.3135 3.73184 10.4954 3.76801C10.6773 3.80419 10.8443 3.89348 10.9754 4.02459C11.1065 4.1557 11.1958 4.32275 11.232 4.5046C11.2682 4.68646 11.2496 4.87496 11.1786 5.04627C11.1077 5.21757 10.9875 5.36399 10.8333 5.467C10.6792 5.57002 10.4979 5.625 10.3125 5.625C10.0639 5.625 9.8254 5.52623 9.64959 5.35041C9.47377 5.1746 9.375 4.93614 9.375 4.6875Z" fill="#141414" />
                </svg>

                <div className="flex flex-col items-center justify-start gap-2">
                    <div className="text-center text-neutral-950 text-sm font-sans font-normal leading-relaxed break-words">
                        upload / drag image (png, jpeg)
                    </div>
                    <div className="text-center text-neutral-600/40 text-sm font-sans font-normal leading-relaxed break-words">
                        max {formatBytes(THUMBNAIL_CONFIG.UPLOAD_MAX_SIZE_BYTES)} size
                    </div>
                </div>

                <input
                    id="thumbnail-upload-input"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleInputChange}
                    multiple
                />
            </Card>

            {/* Status Separator */}
            {items.length > 0 && <Separator className="bg-neutral-200/50" />}

            {/* Results Section */}
            {items.length > 0 && (
                <div className="w-full h-full flex justify-between items-center">
                    <div className="text-center text-ink-1000 text-xl font-[var(--font-instrument-serif)] italic font-normal leading-7 break-words">
                        results ({items.length})
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2.5 py-1.5 hover:bg-neutral-100 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                            >
                                <div className="text-center text-ink-1000 text-sm font-[var(--font-be-vietnam-pro)] font-normal leading-relaxed break-words">
                                    download all
                                </div>
                                <Download className="w-5 h-5 text-ink-1000" strokeWidth={1.5} />
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
                                    onClick={() => handleDownloadAll("png")}
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

                                    <FileImage className="w-5 h-5 text-ink-1000" strokeWidth={1.5} />
                                </button>

                                {/* JPEG */}
                                <button
                                    type="button"
                                    onClick={() => handleDownloadAll("jpg")}
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

                                    <FileText className="w-5 h-5 text-ink-1000" strokeWidth={1.5} />
                                </button>
                            </div>
                        </PopoverContent>


                    </Popover>
                </div>
            )}

            <Separator className="bg-neutral-200/50" />

            {/* Processed Images List (Inlined) */}
            <div className="w-full flex flex-col gap-6">
                {items.map((item, index) => (
                    <React.Fragment key={item.id}>
                        {index > 0 && <Separator className="bg-neutral-200/50" />}
                        <ProcessedImageItem
                            originalFile={item.file}
                            processedBlob={item.blob}
                            status={item.status}
                            errorMsg={item.errorMsg}
                            hasResolutionWarning={item.hasResolutionWarning}
                        />
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
