/**
 * Client-side high-performance image compression utility
 * Automatically scales down high-resolution phone camera photos (2MB - 20MB)
 * to crisp web-optimized images (~100KB - 250KB) in WebP / JPEG format.
 */

export interface CompressionResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    targetFormat?: 'image/webp' | 'image/jpeg';
  } = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.82,
    targetFormat = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    // 1. Read file as Data URL
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.onload = () => {
      const srcUrl = reader.result as string;
      const img = new Image();

      img.onerror = () => {
        // Fallback: Return original file if image element fails decoding
        resolve({
          file,
          dataUrl: srcUrl,
          originalSize: file.size,
          compressedSize: file.size,
          width: 0,
          height: 0,
        });
      };

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect-ratio-preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Draw onto offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({
            file,
            dataUrl: srcUrl,
            originalSize: file.size,
            compressedSize: file.size,
            width,
            height,
          });
          return;
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill white background for transparent images converted to jpeg
        if (targetFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first; test if supported
        let exportFormat = targetFormat;
        let dataUrl = canvas.toDataURL(exportFormat, quality);

        // If browser doesn't support WebP export (returns png data url), fallback to jpeg
        if (exportFormat === 'image/webp' && !dataUrl.startsWith('data:image/webp')) {
          exportFormat = 'image/jpeg';
          dataUrl = canvas.toDataURL(exportFormat, quality);
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                dataUrl,
                originalSize: file.size,
                compressedSize: file.size,
                width,
                height,
              });
              return;
            }

            const ext = exportFormat === 'image/webp' ? 'webp' : 'jpg';
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const compressedFile = new File([blob], `${baseName}.${ext}`, {
              type: exportFormat,
              lastModified: Date.now(),
            });

            resolve({
              file: compressedFile,
              dataUrl,
              originalSize: file.size,
              compressedSize: blob.size,
              width,
              height,
            });
          },
          exportFormat,
          quality
        );
      };

      img.src = srcUrl;
    };

    reader.readAsDataURL(file);
  });
}
