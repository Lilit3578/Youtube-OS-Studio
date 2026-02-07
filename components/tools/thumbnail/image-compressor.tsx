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
import { FileImage, FileText, Download } from "@phosphor-icons/react";


// Internal 
import { useThumbnailCompressor } from "@/libs/hooks/useThumbnailCompressor";
import ProcessedImageItem from "./processed-image-item";
import { THUMBNAIL_CONFIG } from "@/libs/thumbnail-utils";
import { formatBytes } from "@/libs/utils";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/libs/constants/messages";

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

    const validateFile = useCallback((file: File): string | null => {
        const validTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            return ERROR_MESSAGES.TOOLS.THUMBNAIL.UNSUPPORTED_FORMAT;
        }
        const MAX_SIZE = THUMBNAIL_CONFIG.UPLOAD_MAX_SIZE_BYTES;
        if (file.size > MAX_SIZE) {
            return ERROR_MESSAGES.TOOLS.THUMBNAIL.TOO_LARGE;
        }
        return null;
    }, []);

    const MAX_FILE_COUNT = 20;

    const onFilesSelected = useCallback((files: File[]) => {
        if (files.length === 0) return;

        // Limit number of files per batch
        const filesToProcess = files.slice(0, MAX_FILE_COUNT);

        const filesWithValidation = filesToProcess.map(file => ({
            file,
            validationError: validateFile(file)
        }));

        addFiles(filesWithValidation);
    }, [addFiles, validateFile]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(Array.from(e.dataTransfer.files));
        }
    }, [onFilesSelected]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(Array.from(e.target.files));
        }
    }, [onFilesSelected]);

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
            toast.success(SUCCESS_MESSAGES.DOWNLOAD.ALL_IMAGES);
        } catch (error) {
            console.error("Failed to create zip:", error);
            toast.error(ERROR_MESSAGES.TOOLS.THUMBNAIL.ZIP_FAILED);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">

            {/* Upload Zone */}
            <Card
                className={cn(
                    "w-full h-[200px] bg-ink-100 border border-dotted border-ink-400 rounded-xl flex flex-col justify-center items-center gap-4 transition-colors duration-200 cursor-pointer hover:bg-ink-200",
                    isDragging ? "border-primary bg-ink-200" : ""
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("thumbnail-upload-input")?.click()}
            >
                <div className="p-2.5 bg-ink-200 rounded-lg">
                    <FileImage size={24} weight="regular" className="text-foreground" />
                </div>

                <div className="flex flex-col items-center justify-start gap-1">
                    <div className="body text-center text-foreground leading-relaxed">
                        upload / drag images (png, jpeg)
                    </div>
                    <div className="body text-center text-muted-foreground leading-relaxed">
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
            {items.length > 0 && <Separator className="bg-border opacity-50" />}

            {/* Results Section */}
            {items.length > 0 && (
                <div className="w-full flex justify-between items-center mt-4">
                    <div className="text-center text-foreground text-[20px] font-serif font-normal leading-[28px] break-words">
                        results ({items.length})
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-0 hover:bg-transparent rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                            >
                                <div className="body text-center text-foreground leading-relaxed break-words">
                                    download all
                                </div>
                                <Download size={20} weight="regular" className="text-foreground" />
                            </Button>

                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            sideOffset={6}
                            className="
                                w-[180px]
                                p-2
                                bg-popover
                                rounded-xl
                                shadow-lg
                                border border-ink-200
                            "
                        >
                            <div className="flex flex-col gap-1">
                                {/* PNG */}
                                <Button
                                    variant="ghost"
                                    onClick={() => handleDownloadAll("png")}
                                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg h-auto"
                                >
                                    <span className="body text-foreground leading-relaxed">
                                        png
                                    </span>

                                    <FileImage size={20} weight="regular" className="text-foreground" />
                                </Button>

                                {/* JPEG */}
                                <Button
                                    variant="ghost"
                                    onClick={() => handleDownloadAll("jpg")}
                                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg h-auto hover:bg-black/5"
                                >
                                    <span className="body text-neutral-950 leading-relaxed">
                                        jpeg
                                    </span>

                                    <FileText size={20} weight="regular" className="text-neutral-950" />
                                </Button>
                            </div>
                        </PopoverContent>


                    </Popover>
                </div>
            )}

            <div className="w-full h-px bg-border" />

            {/* Processed Images List (Inlined) */}
            <div className="w-full flex flex-col gap-8">
                {items.map((item, index) => (
                    <React.Fragment key={item.id}>
                        {index > 0 && <div className="w-full h-px bg-border" />}
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
