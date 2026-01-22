import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";
import { processImage } from "@/libs/thumbnail-utils";

export interface ProcessedImageItemDetails {
    id: string;
    file: File;
    blob: Blob | null;
    status: "processing" | "done" | "error";
    errorMsg?: string;
    compressionRatio?: number;
    hasResolutionWarning?: boolean;
}

export function useThumbnailCompressor() {
    const [items, setItems] = useState<ProcessedImageItemDetails[]>([]);
    const [isCompressing, setIsCompressing] = useState(false);

    const compressFile = async (file: File): Promise<{ blob: Blob, hasResolutionWarning: boolean }> => {
        try {
            // 1. Pre-process (16:9 crop & resize & upscale check)
            let processingResult;
            try {
                processingResult = await processImage(file);
                // console.log(`Size before compression (Canvas Output): ${(processingResult.processedFile.size / 1024 / 1024).toFixed(2)} MB`);
            } catch (error) {
                // Canvas/Browser error
                throw new Error("Image processing failed due to browser limitations. Please try a smaller image or refresh the page.");
            }

            const { processedFile, hasResolutionWarning } = processingResult;

            // Optimization: If already under 2MB, return immediately to preserve max quality
            if (processedFile.size <= 2 * 1024 * 1024) {
                // console.log("File is under 2MB after crop. Skipping compression.");
                return { blob: processedFile, hasResolutionWarning };
            }

            const options = {
                maxSizeMB: 2, // Target max size as per requirements
                maxWidthOrHeight: 1920, // Full HD max
                useWebWorker: true,
                initialQuality: 1.0, // Start at MAX quality as requested
                alwaysKeepResolution: true, // CRITICAL: Do not downscale dimensions
                fileType: "image/jpeg" // Enforce JPEG for better compression
            };

            const compressedBlob = await imageCompression(processedFile, options);
            // console.log(`Size after compression: ${(compressedBlob.size / 1024 / 1024).toFixed(2)} MB`);

            // Verify size constraint (library usually handles this, but good to double check or catch edge cases)
            if (compressedBlob.size > 2 * 1024 * 1024) {
                throw new Error("Image could not be compressed below 2MB without significant quality loss.");
            }

            return { blob: compressedBlob, hasResolutionWarning };

        } catch (error: any) {
            console.error("Compression failed:", error);
            // Re-throw with our specific messages if they aren't already
            if (error.message.includes("browser limitations") || error.message.includes("compressed below 2MB")) {
                throw error;
            }
            // Generic fallback
            throw new Error("Image compression failed. Please try again.");
        }
    };

    const addFiles = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        // 1. Create initial items (Status: Processing)
        // PREPEND items (Newest -> Oldest) logic: [newItems, ...prev]
        const newEntryIds: string[] = [];

        setItems((prevItems) => {
            const newItems: ProcessedImageItemDetails[] = files.map((file) => {
                const id = Math.random().toString(36).substring(7);
                newEntryIds.push(id);

                return {
                    id,
                    file,
                    blob: null,
                    status: "processing",
                };
            });
            return [...newItems, ...prevItems];
        });

        setIsCompressing(true);

        // 2. Process files with Concurrency Limit (Max 3)
        const CONCURRENCY_LIMIT = 3;
        const executing: Promise<void>[] = [];

        // Map files to task functions
        const tasks = files.map((file, index) => async () => {
            const id = newEntryIds[index];
            try {
                const result = await compressFile(file);
                const { blob: compressedBlob, hasResolutionWarning } = result;

                // Update specific item status to done
                setItems((prev) =>
                    prev.map((item) => {
                        if (item.id !== id) return item;

                        // Calculate basic compression ratio just for state (optional, can be done in UI)
                        const orig = item.file.size;
                        const comp = compressedBlob.size;
                        const ratio = ((orig - comp) / orig); // Store as decimal (e.g. 0.66)

                        return {
                            ...item,
                            status: "done",
                            blob: compressedBlob,
                            compressionRatio: ratio,
                            hasResolutionWarning
                        };
                    })
                );
            } catch (error) {
                // Update status to error
                setItems((prev) =>
                    prev.map((item) =>
                        item.id === id
                            ? { ...item, status: "error", errorMsg: error instanceof Error ? error.message : "Failed" }
                            : item
                    )
                );
            }
        });

        // Execute with concurrency limit
        for (const task of tasks) {
            const p = task().then(() => {
                executing.splice(executing.indexOf(p), 1);
            });
            executing.push(p);
            if (executing.length >= CONCURRENCY_LIMIT) {
                await Promise.race(executing);
            }
        }

        await Promise.all(executing);
        setIsCompressing(false);
    }, []);

    return {
        items,
        addFiles,
        isCompressing
    };
}
