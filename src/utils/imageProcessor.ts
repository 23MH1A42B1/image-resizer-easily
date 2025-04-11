import { sanitizeFileName } from "./fileUtils";

// Image compression function with improved sizing algorithm
export const compressImage = async (
  file: File,
  targetSizeKB: number,
  initialQuality: number = 0.7
): Promise<{
  blob: Blob;
  quality: number;
  dimensions: { width: number; height: number };
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    
    img.onload = async () => {
      try {
        const targetSizeBytes = targetSizeKB * 1024;
        
        // If target is larger than original, just return the original
        if (targetSizeBytes >= file.size) {
          resolve({
            blob: file,
            quality: 1.0,
            dimensions: { width: img.width, height: img.height }
          });
          return;
        }
        
        let bestBlob: Blob | null = null;
        let bestQuality = 0;
        let bestSizeDiff = Infinity;
        const maxAttempts = 30;  // Increased max attempts for better precision
        
        // Create a canvas to draw the image - moved outside the loop for efficiency
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error("Could not create canvas context"));
          return;
        }
        
        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0);
        
        // Binary search for optimal quality
        let minQuality = 0.01; // Minimum quality to try
        let maxQuality = 1.0;  // Maximum quality
        let quality = initialQuality; // Start with initial quality
        let attempt = 0;
        const tolerance = 0.02; // 2% tolerance for target size
        
        // Get MIME type from file or default to jpeg
        const mimeType = file.type || 'image/jpeg';
        
        while (attempt < maxAttempts) {
          attempt++;
          
          // Get blob at current quality
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob(blob => {
              if (blob) resolve(blob);
              else resolve(new Blob([]));
            }, mimeType, quality);
          });
          
          const sizeDiffKB = Math.abs((blob.size - targetSizeBytes) / 1024);
          const sizeRatio = blob.size / targetSizeBytes;
          
          // If within tolerance or we've exhausted attempts, use this one
          if (sizeRatio >= (1 - tolerance) && sizeRatio <= (1 + tolerance) || attempt >= maxAttempts) {
            bestBlob = blob;
            bestQuality = quality;
            break;
          }
          
          // Keep track of the closest match so far
          if (sizeDiffKB < bestSizeDiff) {
            bestBlob = blob;
            bestQuality = quality;
            bestSizeDiff = sizeDiffKB;
          }
          
          // Adjust quality based on result
          if (blob.size > targetSizeBytes) {
            maxQuality = quality;
            quality = (minQuality + quality) / 2;
          } else {
            minQuality = quality;
            quality = (maxQuality + quality) / 2;
          }
        }
        
        if (bestBlob) {
          resolve({
            blob: bestBlob,
            quality: bestQuality,
            dimensions: { width: img.width, height: img.height }
          });
        } else {
          reject(new Error("Failed to compress image"));
        }
      } catch (err) {
        reject(err);
      }
    };
    
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    
    reader.readAsDataURL(file);
  });
};

// Generate a name for the compressed file
export const getCompressedFileName = (originalName: string, sizeKB: number): string => {
  const nameParts = originalName.split('.');
  const extension = nameParts.pop() || 'jpg';
  const baseName = nameParts.join('.');
  
  // Sanitize the filename
  const safeBaseName = sanitizeFileName(baseName);
  
  return `${safeBaseName}-compressed-${sizeKB}kb.${extension.toLowerCase()}`;
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  } else {
    return `${Math.round(bytes / 1024)} KB`;
  }
};

// Create a utility to sanitize filenames
export const sanitizeFileName = (fileName: string): string => {
  // Remove invalid characters for filenames
  return fileName
    .replace(/[/\\?%*:|"<>]/g, '-') // Replace invalid chars with dash
    .replace(/\s+/g, '-')           // Replace spaces with dash
    .replace(/-+/g, '-')            // Replace multiple dashes with single dash
    .trim();
};
