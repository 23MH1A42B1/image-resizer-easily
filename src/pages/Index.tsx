
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import UploadArea from "@/components/UploadArea";
import ImagePreview from "@/components/ImagePreview";
import CompressionControl from "@/components/CompressionControl";
import { compressImage, getCompressedFileName } from "@/utils/imageProcessor";
import { SlidersHorizontal, Image } from "lucide-react";

const Index = () => {
  const [originalImage, setOriginalImage] = useState<{
    file: File;
    url: string;
  } | null>(null);
  
  const [compressedImage, setCompressedImage] = useState<{
    blob: Blob;
    url: string;
    quality: number;
    dimensions: {
      width: number;
      height: number;
    };
  } | null>(null);
  
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleImageSelected = (file: File) => {
    // Create URL for the file
    const imageUrl = URL.createObjectURL(file);
    setOriginalImage({ file, url: imageUrl });
    setCompressedImage(null);
  };

  const handleCompress = async (targetSizeKB: number, quality: number) => {
    if (!originalImage) return;

    setIsCompressing(true);
    try {
      const result = await compressImage(originalImage.file, targetSizeKB, quality);
      const compressedUrl = URL.createObjectURL(result.blob);
      
      setCompressedImage({
        blob: result.blob,
        url: compressedUrl,
        quality: result.quality,
        dimensions: result.dimensions
      });

      toast({
        title: "Image compressed successfully!",
        description: `Reduced from ${Math.round(originalImage.file.size / 1024)}KB to ${Math.round(result.blob.size / 1024)}KB`,
      });
    } catch (error) {
      console.error("Compression error:", error);
      toast({
        title: "Compression failed",
        description: "There was an error processing your image",
        variant: "destructive",
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedImage || !originalImage) return;
    
    setIsDownloading(true);
    
    try {
      const compressedSizeKB = Math.round(compressedImage.blob.size / 1024);
      const fileName = getCompressedFileName(originalImage.file.name, compressedSizeKB);
      
      const downloadLink = document.createElement("a");
      downloadLink.href = compressedImage.url;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast({
        title: "Download started",
        description: `Saved as ${fileName}`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading your image",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image size={24} className="text-primary" />
              <h1 className="text-xl font-bold">Smart Image Resizer</h1>
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} />
              <span className="text-sm text-muted-foreground">Image Compressor</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Compress Images to Your Target Size</h2>
            <p className="text-muted-foreground">
              Upload an image, set your desired file size, and we'll optimize it while maintaining quality
            </p>
          </div>

          {!originalImage ? (
            <UploadArea onImageSelected={handleImageSelected} />
          ) : (
            <>
              <CompressionControl
                fileSize={originalImage.file.size}
                isCompressing={isCompressing}
                onCompress={handleCompress}
              />
              
              <ImagePreview
                originalImage={originalImage}
                compressedImage={compressedImage || undefined}
                fileName={originalImage.file.name}
                downloading={isDownloading}
                onDownload={handleDownload}
              />
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setOriginalImage(null);
                    setCompressedImage(null);
                    // Clean up object URLs
                    if (originalImage) URL.revokeObjectURL(originalImage.url);
                    if (compressedImage) URL.revokeObjectURL(compressedImage.url);
                  }}
                  className="text-primary underline hover:text-primary/80"
                >
                  Upload a different image
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      
      <footer className="mt-auto py-6 border-t bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Smart Image Resizer & Compressor - Optimize your images with precision</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
