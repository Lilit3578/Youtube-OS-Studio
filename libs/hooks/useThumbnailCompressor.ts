import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";
import { processImage, THUMBNAIL_CONFIG } from "@/libs/thumbnail-utils";
import { ERROR_MESSAGES } from "@/libs/constants/messages";

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
                throw new Error(ERROR_MESSAGES.TOOLS.THUMBNAIL.BROWSER_LIMIT);
            }

            const { processedFile, hasResolutionWarning } = processingResult;

            // Optimization: If already under the YouTube limit, return immediately to preserve max quality
            if (processedFile.size <= THUMBNAIL_CONFIG.MAX_SIZE_BYTES) {
                // console.log("File is under 2MB after crop. Skipping compression.");
                return { blob: processedFile, hasResolutionWarning };
            }

            const options = {
                maxSizeMB: THUMBNAIL_CONFIG.MAX_SIZE_BYTES / 1024 / 1024, // Target max size as per requirements
                maxWidthOrHeight: THUMBNAIL_CONFIG.TARGET_WIDTH_LARGE, // Full HD max
                useWebWorker: true,
                initialQuality: 1.0, // Start at MAX quality as requested
                alwaysKeepResolution: true, // CRITICAL: Do not downscale dimensions
                fileType: "image/jpeg" // Enforce JPEG for better compression
            };

            const compressedBlob = await imageCompression(processedFile, options);
            // console.log(`Size after compression: ${(compressedBlob.size / 1024 / 1024).toFixed(2)} MB`);

            // Verify size constraint (library usually handles this, but good to double check or catch edge cases)
            if (compressedBlob.size > THUMBNAIL_CONFIG.MAX_SIZE_BYTES) {
                throw new Error(ERROR_MESSAGES.TOOLS.THUMBNAIL.COMPRESSION_LIMIT);
            }

            return { blob: compressedBlob, hasResolutionWarning };

        } catch (error) {
            console.error("Compression failed:", error);
            const message = error instanceof Error ? error.message : ERROR_MESSAGES.TOOLS.THUMBNAIL.GENERIC_FAIL;

            // Re-throw with our specific messages if they aren't already
            if (message === ERROR_MESSAGES.TOOLS.THUMBNAIL.BROWSER_LIMIT || message === ERROR_MESSAGES.TOOLS.THUMBNAIL.COMPRESSION_LIMIT) {
                throw error;
            }
            // Generic fallback
            throw new Error(message);
        }
    };

    const addFiles = useCallback(async (fileInputs: { file: File; validationError: string | null }[]) => {
        if (fileInputs.length === 0) return;

        // 1. Create initial items
        // PREPEND items (Newest -> Oldest) logic: [newItems, ...prev]
        const newEntryIds: string[] = [];
        const validFilesToCompress: { file: File; id: string }[] = [];

        setItems((prevItems) => {
            const newItems: ProcessedImageItemDetails[] = fileInputs.map(({ file, validationError }) => {
                const id = Math.random().toString(36).substring(7);
                newEntryIds.push(id);

                if (validationError) {
                    return {
                        id,
                        file,
                        blob: null,
                        status: "error",
                        errorMsg: validationError
                    };
                }

                // If no validation error, mark for compression
                validFilesToCompress.push({ file, id });

                return {
                    id,
                    file,
                    blob: null,
                    status: "processing",
                };
            });
            return [...newItems, ...prevItems];
        });

        if (validFilesToCompress.length === 0) return;

        setIsCompressing(true);

        // 2. Process files with Concurrency Limit (Max 3)
        const CONCURRENCY_LIMIT = 3;
        const executing: Promise<void>[] = [];

        // Map valid files to task functions
        const tasks = validFilesToCompress.map(({ file, id }) => async () => {
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
