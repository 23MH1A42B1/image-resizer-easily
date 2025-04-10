
// This utility handles the image compression and resizing

/**
 * Compresses an image to a target file size
 * @param file Original image file
 * @param targetSizeKB Target size in KB
 * @param initialQuality Starting quality (0-1)
 * @returns Promise with the compressed image blob
 */
export const compressImage = async (
  file: File,
  targetSizeKB: number,
  initialQuality = 0.7
): Promise<{ blob: Blob; quality: number; dimensions: { width: number; height: number } }> => {
  return new Promise((resolve, reject) => {
    // Create an image element to load the file
    const img = new Image();
    const reader = new FileReader();

    reader.onload = function (e) {
      img.onload = function () {
        // Binary search for optimal quality
        let minQuality = 0.1;
        let maxQuality = 1.0;
        let quality = initialQuality;
        let blob: Blob;
        let attempts = 0;
        const maxAttempts = 10;
        
        // Start the compression loop
        compressLoop(quality);
        
        function compressLoop(currentQuality: number) {
          attempts++;
          
          // Create a canvas to draw the image
          const canvas = document.createElement('canvas');
          // Calculate dimensions - maintain aspect ratio
          const maxDimension = 1800; // Limit max dimension
          const aspectRatio = img.width / img.height;
          let width = img.width;
          let height = img.height;
          
          // Resize if needed (this already helps with file size)
          if (width > maxDimension || height > maxDimension) {
            if (aspectRatio > 1) {
              width = maxDimension;
              height = width / aspectRatio;
            } else {
              height = maxDimension;
              width = height * aspectRatio;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with current quality
          canvas.toBlob(
            (result) => {
              if (!result) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              blob = result;
              const sizeInKB = result.size / 1024;
              
              console.log(`Attempt ${attempts}: Quality ${currentQuality.toFixed(2)}, Size: ${sizeInKB.toFixed(1)}KB, Target: ${targetSizeKB}KB`);
              
              // Check if we're close enough to target or reached max attempts
              const sizeRatio = sizeInKB / targetSizeKB;
              if ((sizeRatio >= 0.95 && sizeRatio <= 1.05) || attempts >= maxAttempts) {
                // We've reached target size or max attempts, return result
                resolve({
                  blob: result,
                  quality: currentQuality,
                  dimensions: { width, height }
                });
              } else {
                // Binary search for next quality level
                if (sizeInKB > targetSizeKB) {
                  maxQuality = currentQuality;
                  quality = (minQuality + currentQuality) / 2;
                } else {
                  minQuality = currentQuality;
                  quality = (maxQuality + currentQuality) / 2;
                }
                
                // Continue the loop with new quality
                compressLoop(quality);
              }
            },
            file.type, // Keep same format
            currentQuality // Use current quality level
          );
        }
      };
      
      img.onerror = function() {
        reject(new Error('Failed to load image'));
      };
      
      // Load the image from data URL
      img.src = e.target?.result as string;
    };
    
    reader.onerror = function() {
      reject(new Error('Failed to read file'));
    };
    
    // Read the file
    reader.readAsDataURL(file);
  });
};

/**
 * Get file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
};

/**
 * Get formatted filename with size indicator
 */
export const getCompressedFileName = (originalName: string, sizeKB: number): string => {
  const nameParts = originalName.split('.');
  const ext = nameParts.pop();
  const baseName = nameParts.join('.');
  
  // Format the size for display (KB or MB)
  let sizeDisplay: string;
  if (sizeKB >= 1024) {
    sizeDisplay = `${(sizeKB / 1024).toFixed(1)}mb`;
  } else {
    sizeDisplay = `${Math.round(sizeKB)}kb`;
  }
  
  return `${baseName}_${sizeDisplay}.${ext}`;
};
