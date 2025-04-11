
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface CompressionControlProps {
  fileSize: number;
  isCompressing: boolean;
  onCompress: (targetSizeKB: number, quality: number) => void;
}

const CompressionControl: React.FC<CompressionControlProps> = ({
  fileSize,
  isCompressing,
  onCompress,
}) => {
  const fileSizeKB = fileSize / 1024;
  const maxSizeKB = Math.min(10 * 1024, fileSizeKB); // 10MB in KB or original size, whichever is smaller
  
  // Default target size - 80% of original or 1024KB (1MB), whichever is smaller
  const initialTargetSize = Math.min(Math.round(fileSizeKB * 0.8), 1024);
  const [targetSizeKB, setTargetSizeKB] = useState(
    Math.max(10, initialTargetSize) // Ensure minimum 10KB
  );
  
  // Default initial quality - will be adjusted by the algorithm
  const defaultQuality = 0.7;

  // Update target size when file size changes
  useEffect(() => {
    // Only update if file size changes significantly
    const newTargetSize = Math.min(Math.round(fileSizeKB * 0.8), 1024);
    setTargetSizeKB(Math.max(10, newTargetSize)); // Ensure minimum 10KB
  }, [fileSize, fileSizeKB]);

  const handleTargetSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 10) { // Minimum 10KB to prevent extreme compression
      setTargetSizeKB(10);
    } else {
      // Allow up to original size or 10MB, whichever is smaller
      setTargetSizeKB(Math.min(value, maxSizeKB)); 
    }
  };

  // Set to 1024 KB (1MB equivalent) button
  const setTo1024KB = () => {
    setTargetSizeKB(Math.min(1024, fileSizeKB));
  };
  
  // Helper to calculate percentage of original size
  const percentOfOriginal = Math.round((targetSizeKB / fileSizeKB) * 100);
  
  // Warn if compression is too aggressive
  const isAggressiveCompression = percentOfOriginal < 20 && fileSizeKB > 500;

  return (
    <div className="bg-white border rounded-lg p-4 mt-4">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md">
          <Label htmlFor="targetSize" className="mb-1.5 block text-center font-medium">
            Target Size (KB)
          </Label>
          <div className="flex gap-2 mb-2 justify-center">
            <Input
              id="targetSize"
              type="number"
              min={10}
              max={maxSizeKB}
              value={targetSizeKB}
              onChange={handleTargetSizeChange}
              className="text-right w-32"
            />
            <Button
              variant="outline"
              onClick={setTo1024KB}
              type="button"
              className="whitespace-nowrap"
            >
              Set to 1024 KB
            </Button>
          </div>
          <div className="text-center mt-2">
            <p className="text-sm text-muted-foreground">
              Original: {Math.round(fileSizeKB)} KB • Target: {percentOfOriginal}% of original
            </p>
            {isAggressiveCompression && (
              <p className="text-xs text-amber-600 mt-1">
                Warning: Very aggressive compression may result in quality loss
              </p>
            )}
          </div>
        </div>

        <Button
          className="w-full max-w-md mt-4"
          onClick={() => onCompress(targetSizeKB, defaultQuality)}
          disabled={isCompressing || targetSizeKB < 10}
        >
          {isCompressing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Compressing...
            </>
          ) : (
            "Compress Image"
          )}
        </Button>
      </div>
    </div>
  );
};

export default CompressionControl;
