export async function processImage(
    file: File
): Promise<{ processedFile: File; hasResolutionWarning: boolean }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            const originalWidth = img.width;
            const originalHeight = img.height;

            // Smart Resolution Logic for YouTube
            // If original width >= 1920 -> Target 1920 x 1080
            // If original width < 1920 -> Target 1280 x 720 (Upscale if necessary)
            const targetWidth = originalWidth >= 1920 ? 1920 : 1280;
            const targetHeight = originalWidth >= 1920 ? 1080 : 720;

            // Detect if optimization required upscaling from a low-res original
            // YouTube minimum recommendation is 1280x720.
            const hasResolutionWarning = originalWidth < 1280 || originalHeight < 720;

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
                (blob) => {
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
