
import React from "react";
import { Download, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/utils/imageProcessor";

interface ImagePreviewProps {
  originalImage: {
    url: string;
    file: File;
  };
  compressedImage?: {
    url: string;
    blob: Blob;
    quality: number;
    dimensions: {
      width: number;
      height: number;
    };
  };
  fileName: string;
  downloading: boolean;
  onDownload: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  originalImage,
  compressedImage,
  fileName,
  downloading,
  onDownload,
}) => {
  const originalSizeKB = originalImage.file.size / 1024;
  const compressedSizeKB = compressedImage ? compressedImage.blob.size / 1024 : 0;
  const compressionRatio = compressedImage ? (compressedSizeKB / originalSizeKB) * 100 : 0;
  const savedSize = originalSizeKB - compressedSizeKB;

  return (
    <div className="grid lg:grid-cols-2 gap-6 mt-8">
      {/* Original Image */}
      <div className="border rounded-lg overflow-hidden flex flex-col">
        <div className="bg-muted/50 p-3 flex justify-between items-center border-b">
          <p className="font-medium">Original Image</p>
          <p className="text-sm text-muted-foreground">{formatFileSize(originalImage.file.size)}</p>
        </div>
        <div className="flex-grow flex items-center justify-center p-4 bg-gray-50">
          <div className="relative group aspect-auto h-auto max-h-[300px] overflow-hidden">
            <img 
              src={originalImage.url} 
              alt="Original" 
              className="object-contain max-h-[300px] max-w-full"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ZoomIn className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Compressed Image */}
      {compressedImage ? (
        <div className="border rounded-lg overflow-hidden flex flex-col">
          <div className="bg-muted/50 p-3 flex justify-between items-center border-b">
            <p className="font-medium">Compressed Image</p>
            <p className="text-sm text-muted-foreground">{formatFileSize(compressedImage.blob.size)}</p>
          </div>
          <div className="flex-grow flex items-center justify-center p-4 bg-gray-50">
            <div className="relative group aspect-auto h-auto max-h-[300px] overflow-hidden">
              <img 
                src={compressedImage.url} 
                alt="Compressed" 
                className="object-contain max-h-[300px] max-w-full"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="text-white" />
              </div>
            </div>
          </div>
          <div className="p-4 border-t bg-white">
            <div className="flex flex-wrap gap-2 justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Quality</p>
                <p className="font-semibold">{Math.round(compressedImage.quality * 100)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size Reduction</p>
                <p className="font-semibold">{Math.round(100 - compressionRatio)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Space Saved</p>
                <p className="font-semibold">{formatFileSize(savedSize * 1024)}</p>
              </div>
            </div>
            <Button 
              className="w-full flex gap-2" 
              onClick={onDownload}
              disabled={downloading}
            >
              <Download size={18} />
              {downloading ? 'Processing...' : 'Download'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg flex items-center justify-center p-8 text-center">
          <p className="text-muted-foreground">
            Compressed image will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
