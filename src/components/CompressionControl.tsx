
import React, { useState } from "react";
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
  const maxSizeKB = 10 * 1024; // 10MB in KB
  const [targetSizeKB, setTargetSizeKB] = useState(
    Math.max(20, Math.round(fileSizeKB * 0.5))
  ); // Default to 50% of original
  const [quality, setQuality] = useState(0.7); // Default quality value

  const handleTargetSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value <= 0) {
      setTargetSizeKB(0);
    } else {
      // Allow up to 10MB or original size, whichever is smaller
      setTargetSizeKB(Math.min(value, Math.max(maxSizeKB, fileSizeKB))); 
    }
  };

  const handleQualityChange = (value: number[]) => {
    setQuality(value[0] / 100);
  };

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
              min={1}
              max={maxSizeKB}
              value={targetSizeKB}
              onChange={handleTargetSizeChange}
            />
            <Button
              variant="outline"
              onClick={() => setTargetSizeKB(Math.max(20, Math.round(fileSizeKB * 0.5)))}
              type="button"
            >
              50%
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Original: {Math.round(fileSizeKB)} KB • Max allowed: 10,240 KB (10MB)
          </p>
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
        disabled={isCompressing || targetSizeKB <= 0}
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
