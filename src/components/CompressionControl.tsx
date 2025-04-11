
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

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
  const maxSizeKB = Math.min(10000, fileSizeKB); // 10000KB (10MB) or original size, whichever is smaller
  
  // Default target size - 80% of original or 1024KB (1MB), whichever is smaller
  const initialTargetSize = Math.min(Math.round(fileSizeKB * 0.8), 1024);
  const [targetSizeKB, setTargetSizeKB] = useState(
    Math.max(0, initialTargetSize) // Ensure minimum 0KB
  );
  
  // Default initial quality - will be adjusted by the algorithm
  const defaultQuality = 0.7;

  // Update target size when file size changes
  useEffect(() => {
    // Only update if file size changes significantly
    const newTargetSize = Math.min(Math.round(fileSizeKB * 0.8), 1024);
    setTargetSizeKB(Math.max(0, newTargetSize)); // Ensure minimum 0KB
  }, [fileSize, fileSizeKB]);

  const handleTargetSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let value = parseInt(inputValue, 10);
    
    if (isNaN(value)) {
      value = 0; // Default to minimum if not a number
    }
    
    // Ensure the value is within valid range
    value = Math.max(0, Math.min(value, maxSizeKB));
    setTargetSizeKB(value);
  };
  
  const handleSliderChange = (value: number[]) => {
    setTargetSizeKB(value[0]);
  };

  // Set to 1024 KB (1MB equivalent) button
  const setTo1024KB = () => {
    setTargetSizeKB(Math.min(1024, maxSizeKB));
  };
  
  // Helper to calculate percentage of original size
  const percentOfOriginal = Math.round((targetSizeKB / fileSizeKB) * 100);
  
  // Warn if compression is too aggressive
  const isAggressiveCompression = percentOfOriginal < 20 && fileSizeKB > 500;

  return (
    <div className="bg-white border rounded-lg p-4 mt-4">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md space-y-4">
          <Label htmlFor="targetSize" className="text-center block font-medium mb-1">
            Target Size: {targetSizeKB} KB ({percentOfOriginal}% of original)
          </Label>
          
          <div className="px-2">
            <Slider
              value={[targetSizeKB]}
              min={0}
              max={maxSizeKB}
              step={1}
              onValueChange={handleSliderChange}
              className="mb-4"
            />
          </div>
          
          <div className="flex gap-2 justify-center">
            <Input
              id="targetSize"
              type="number"
              min={0}
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
              Set to 1MB
            </Button>
          </div>

          {isAggressiveCompression && (
            <p className="text-xs text-amber-600 mt-1 text-center">
              Warning: Very aggressive compression may result in quality loss
            </p>
          )}
        </div>

        <Button
          className="w-full max-w-md mt-4"
          onClick={() => onCompress(targetSizeKB, defaultQuality)}
          disabled={isCompressing || targetSizeKB < 0}
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
