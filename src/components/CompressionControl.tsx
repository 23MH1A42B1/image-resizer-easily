
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  
  const [quality, setQuality] = useState(0.7); // Default quality value

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

  const handleQualityChange = (value: number[]) => {
    setQuality(value[0] / 100);
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
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="targetSize" className="mb-1.5 block">
            Target Size (KB)
          </Label>
          <div className="flex gap-2">
            <Input
              id="targetSize"
              type="number"
              min={10}
              max={maxSizeKB}
              value={targetSizeKB}
              onChange={handleTargetSizeChange}
              className="text-right"
            />
            <Button
              variant="outline"
              onClick={setTo1024KB}
              type="button"
            >
              1024KB
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Original: {Math.round(fileSizeKB)} KB • Target: {percentOfOriginal}% of original
          </p>
          {isAggressiveCompression && (
            <p className="text-xs text-amber-600 mt-1">
              Warning: Very aggressive compression may result in quality loss
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="quality" className="mb-1.5 block">
            Initial Quality: {Math.round(quality * 100)}%
          </Label>
          <Slider
            id="quality"
            defaultValue={[70]}
            min={10}
            max={100}
            step={1}
            onValueChange={handleQualityChange}
          />
          <p className="text-xs text-muted-foreground mt-1">
            The algorithm will adjust quality to meet the target size
          </p>
        </div>
      </div>

      <Button
        className="w-full mt-4"
        onClick={() => onCompress(targetSizeKB, quality)}
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
  );
};

export default CompressionControl;
