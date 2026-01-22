"use client";

import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/libs/utils";
import toast from "react-hot-toast";

// Internal 
import { useThumbnailCompressor } from "@/libs/hooks/useThumbnailCompressor";
import ProcessedImageItem from "./ProcessedImageItem";

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
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_SIZE) {
            toast.error("This image is too large. Please upload a smaller file.");
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
                <div className="w-5 h-5 relative flex items-center justify-center border border-neutral-950 rounded-[1px]">
                    <div className="w-[16.25px] h-[13.75px] bg-neutral-950 absolute bottom-[3px]" />
                </div>

                <div className="flex flex-col items-center justify-start gap-2">
                    <div className="text-center text-neutral-950 text-sm font-sans font-normal leading-relaxed break-words">
                        upload / drag image (png, jpeg)
                    </div>
                    <div className="text-center text-neutral-600/40 text-sm font-sans font-normal leading-relaxed break-words">
                        max 10mb size
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
            {items.length > 0 && <div className="w-full border-t border-neutral-200/50" />}

            {/* Processed Images List (Inlined) */}
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
        </div>
    );
}
