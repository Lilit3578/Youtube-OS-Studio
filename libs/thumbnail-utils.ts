/**
 * Constants for YouTube Thumbnail Processing
 */
export const THUMBNAIL_CONFIG = {
    MAX_SIZE_BYTES: 2 * 1024 * 1024, // 2MB YouTube limit
    UPLOAD_MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB internal limit
    TARGET_WIDTH_LARGE: 1920,
    TARGET_HEIGHT_LARGE: 1080,
    TARGET_WIDTH_SMALL: 1280,
    TARGET_HEIGHT_SMALL: 720,
    YT_MIN_WIDTH: 1280,
    YT_MIN_HEIGHT: 720,
};

export async function processImage(
    file: File
): Promise<{ processedFile: File; hasResolutionWarning: boolean }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            // HIGH-01 Fix: Revoke immediately
            URL.revokeObjectURL(url);

            const originalWidth = img.width;
            const originalHeight = img.height;

            // Smart Resolution Logic for YouTube
            // If original width >= 1920 -> Target 1920 x 1080
            // If original width < 1920 -> Target 1280 x 720 (Upscale if necessary)
            const targetWidth = originalWidth >= THUMBNAIL_CONFIG.TARGET_WIDTH_LARGE ? THUMBNAIL_CONFIG.TARGET_WIDTH_LARGE : THUMBNAIL_CONFIG.TARGET_WIDTH_SMALL;
            const targetHeight = originalWidth >= THUMBNAIL_CONFIG.TARGET_WIDTH_LARGE ? THUMBNAIL_CONFIG.TARGET_HEIGHT_LARGE : THUMBNAIL_CONFIG.TARGET_HEIGHT_SMALL;

            // Detect if optimization required upscaling from a low-res original
            // YouTube minimum recommendation is 1280x720.
            const hasResolutionWarning = originalWidth < THUMBNAIL_CONFIG.YT_MIN_WIDTH || originalHeight < THUMBNAIL_CONFIG.YT_MIN_HEIGHT;

            // Create canvas
            const canvas = document.createElement("canvas");
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            // Enforce 16:9 Center Crop (or Upscale)
            // Calculate scale to cover the target dimensions
            const scale = Math.max(targetWidth / originalWidth, targetHeight / originalHeight);

            const scaledWidth = originalWidth * scale;
            const scaledHeight = originalHeight * scale;

            // Center the image
            const x = (targetWidth - scaledWidth) / 2;
            const y = (targetHeight - scaledHeight) / 2;

            // Draw image with highest quality settings
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);


            // Convert back to File
            // CRITICAL: Output as PNG to prevent "Generation Loss" (Double JPEG artifacting)
            // The browser-image-compression library will handle the final JPEG encoding.
            canvas.toBlob(
                (blob: Blob | null) => {
                    if (blob) {
                        const processedFile = new File([blob], file.name, {
                            type: "image/png",
                            lastModified: Date.now(),
                        });
                        resolve({ processedFile, hasResolutionWarning });
                    } else {
                        reject(new Error("Canvas to Blob conversion failed"));
                    }
                },
                "image/png"
            );
        };

        img.onerror = (error) => {
            // HIGH-01 Fix: Revoke on error too
            URL.revokeObjectURL(url);
            reject(error);
        };

        img.src = url;
    });
}

/**
 * Helper to check if a file is an image
 */
export const isImageFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    return validTypes.includes(file.type);
};
