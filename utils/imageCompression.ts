/**
 * Image Compression Utility
 * Automatically compresses images to fit website parameters
 */

// Website image parameters
export const IMAGE_PARAMS = {
  PRODUCT: {
    // Primary display: 400x192px (16:10.4 aspect ratio for cards)
    maxWidth: 800, // 2x for high DPI devices
    maxHeight: 384, // 2x for high DPI devices
    quality: 0.75, // JPEG quality
    maxFileSizeMB: 0.5, // Max file size 500KB
  },
  ANNOUNCEMENT: {
    maxWidth: 1200,
    maxHeight: 600,
    quality: 0.8,
    maxFileSizeMB: 1,
  },
};

/**
 * Compress image using Canvas API (client-side)
 * Works in browser without external dependencies
 */
export const compressImage = async (
  file: File,
  type: 'PRODUCT' | 'ANNOUNCEMENT' = 'PRODUCT'
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const params = IMAGE_PARAMS[type];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Calculate new dimensions maintaining aspect ratio
          const aspectRatio = width / height;
          if (width > params.maxWidth) {
            width = params.maxWidth;
            height = width / aspectRatio;
          }
          if (height > params.maxHeight) {
            height = params.maxHeight;
            width = height * aspectRatio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with quality setting
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // Check file size and reduce quality if needed
              if (blob.size > params.maxFileSizeMB * 1024 * 1024) {
                let quality = params.quality;
                const qualityReduction = () => {
                  quality *= 0.9;
                  if (quality < 0.3) {
                    // Fallback if still too large
                    resolve(blob);
                    return;
                  }
                  canvas.toBlob(
                    (newBlob) => {
                      if (!newBlob || newBlob.size > params.maxFileSizeMB * 1024 * 1024) {
                        qualityReduction();
                      } else {
                        resolve(newBlob);
                      }
                    },
                    'image/jpeg',
                    quality
                  );
                };
                qualityReduction();
              } else {
                resolve(blob);
              }
            },
            'image/jpeg',
            params.quality
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Get compression stats for display
 */
export const getCompressionStats = (
  originalSize: number,
  compressedSize: number
): { reduction: string; originalMB: string; compressedMB: string } => {
  const originalMB = (originalSize / (1024 * 1024)).toFixed(2);
  const compressedMB = (compressedSize / (1024 * 1024)).toFixed(2);
  const reduction = (((originalSize - compressedSize) / originalSize) * 100).toFixed(0);

  return { reduction, originalMB, compressedMB };
};
