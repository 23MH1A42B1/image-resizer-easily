
/**
 * Utility to sanitize filenames by removing invalid characters
 */
export const sanitizeFileName = (fileName: string): string => {
  // Remove invalid characters for filenames
  return fileName
    .replace(/[/\\?%*:|"<>]/g, '-') // Replace invalid chars with dash
    .replace(/\s+/g, '-')           // Replace spaces with dash
    .replace(/-+/g, '-')            // Replace multiple dashes with single dash
    .trim();
};
