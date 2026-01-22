"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/libs/utils";
import { UploadCloud } from "lucide-react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

interface UploadCardProps {
    onFilesSelected: (files: File[]) => void;
    isDragActive?: boolean;
}

export default function UploadCard({
    onFilesSelected,
    isDragActive: externalDragActive,
}: UploadCardProps) {
    const [isDragging, setIsDragging] = useState(false);

    // Combine external and internal drag state (if external is provided)
    const active = externalDragActive || isDragging;

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
        // 1. Check File Type
        const validTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            toast.error("Unsupported file format. Only JPG and PNG images are supported.");
            return false;
        }

        // 2. Check File Size (10MB soft limit)
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_SIZE) {
            toast.error("This image is too large. Please upload a smaller file.");
            return false;
        }

        return true;
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const files = Array.from(e.dataTransfer.files);
                const validFiles = files.filter(validateFile);

                if (validFiles.length > 0) {
                    onFilesSelected(validFiles);
                }
            }
        },
        [onFilesSelected]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                const files = Array.from(e.target.files);
                const validFiles = files.filter(validateFile);

                if (validFiles.length > 0) {
                    onFilesSelected(validFiles);
                }
            }
        },
        [onFilesSelected]
    );

    return (
        <Card
            className={cn(
                "w-full p-10 bg-neutral-50/50 border border-dashed border-neutral-200 rounded-lg flex flex-col justify-center items-center gap-4 transition-colors duration-200 cursor-pointer hover:bg-neutral-100",
                active ? "border-primary bg-neutral-100" : ""
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
    );
}
