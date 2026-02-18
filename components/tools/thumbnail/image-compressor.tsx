"use client";

import React, { useState, useCallback } from "react";
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
    const { items, addFiles, isCompressing } = useThumbnailCompressor();
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

        // Limit number of files per batch — warn the user if we had to truncate
        const filesToProcess = files.slice(0, MAX_FILE_COUNT);
        if (files.length > MAX_FILE_COUNT) {
            toast.error(`Only ${MAX_FILE_COUNT} images can be processed at once. ${files.length - MAX_FILE_COUNT} file(s) were skipped.`);
        }

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
        if (completedItems.length === 0) {
            toast.error("No completed images to download yet.");
            return;
        }

        try {
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();

            completedItems.forEach((item) => {
                if (item.blob) {
                    const nameWithoutExt = item.file.name.substring(0, item.file.name.lastIndexOf(".")) || item.file.name;
                    // Derive extension from the blob's actual MIME type — not the user-selected
                    // format — to avoid mislabeled files (e.g. a JPEG blob named .png).
                    const actualExtension = item.blob.type === "image/png" ? ".png" : ".jpg";
                    const fullFilename = `${nameWithoutExt}-optimized${actualExtension}`;
                    zip.file(fullFilename, item.blob);
                }
            });

            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            // Use a generic name — the format param only affects the user's selection label,
            // not the actual file contents (extensions are derived from blob MIME type above).
            a.download = `compressed-thumbnails.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success(SUCCESS_MESSAGES.DOWNLOAD.ALL_IMAGES);
        } catch (error) {
            toast.error(ERROR_MESSAGES.TOOLS.THUMBNAIL.ZIP_FAILED);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">

            {/* Upload Zone */}
            <div
                className={cn(
                    "w-full bg-ink-200 border border-ink-300 border-dashed rounded-md flex flex-col justify-center items-center gap-4 p-10 transition-colors duration-200",
                    isCompressing
                        ? "opacity-50 cursor-not-allowed pointer-events-none"
                        : "cursor-pointer hover:bg-ink-300",
                    isDragging && !isCompressing ? "border-primary bg-ink-300" : ""
                )}
                onDragOver={isCompressing ? undefined : handleDragOver}
                onDragLeave={isCompressing ? undefined : handleDragLeave}
                onDrop={isCompressing ? undefined : handleDrop}
                onClick={() => !isCompressing && document.getElementById("thumbnail-upload-input")?.click()}
            >
                <div>
                    <FileImage />
                </div>

                <div className="flex flex-col items-center gap-[8px]">
                    <p className="body text-center text-foreground">
                        upload / drag images (png, jpeg)
                    </p>
                    <p className="body text-center text-muted-foreground">
                        max {formatBytes(THUMBNAIL_CONFIG.UPLOAD_MAX_SIZE_BYTES)} size
                    </p>
                </div>

                <input
                    id="thumbnail-upload-input"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleInputChange}
                    multiple
                    disabled={isCompressing}
                />
            </div>

            {/* Status Separator */}
            {items.length > 0 && <Separator className="bg-border opacity-50" />}

            {/* Results Section */}
            {items.length > 0 && (
                <div className="w-full flex justify-between items-center">
                    <p className="h2-italic text-foreground">
                        results ({items.length})
                    </p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-0 hover:bg-transparent rounded-lg flex items-center gap-[8px] cursor-pointer transition-colors !normal-case"
                            >
                                <p className="body text-foreground">
                                    download all
                                </p>
                                <Download size={20} weight="regular" className="text-foreground" />
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
                                    onClick={() => handleDownloadAll("png")}
                                    className="flex items-center justify-between w-full px-[10px] py-[6px] rounded-[8px] h-auto cursor-pointer"
                                >
                                    <span className="body text-foreground">
                                        png
                                    </span>

                                    <FileImage size={20} weight="regular" className="text-foreground" />
                                </Button>

                                {/* JPEG */}
                                <Button
                                    variant="ghost"
                                    onClick={() => handleDownloadAll("jpg")}
                                    className="flex items-center justify-between w-full px-[10px] py-[6px] rounded-[8px] h-auto cursor-pointer"
                                >
                                    <span className="body text-foreground">
                                        jpeg
                                    </span>

                                    <FileText size={20} weight="regular" className="text-foreground" />
                                </Button>
                            </div>
                        </PopoverContent>


                    </Popover>
                </div>
            )}

            <Separator className="bg-border" />

            {/* Processed Images List (Inlined) */}
            <div className="w-full flex flex-col gap-8">
                {items.map((item, index) => (
                    <React.Fragment key={item.id}>
                        {index > 0 && <div className="w-full h-px bg-border" />}
                        <ProcessedImageItem
                            originalFile={item.originalFile}
                            processedFile={item.file}
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
