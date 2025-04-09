
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import UploadArea from "@/components/UploadArea";
import ImagePreview from "@/components/ImagePreview";
import CompressionControl from "@/components/CompressionControl";
import { compressImage, getCompressedFileName } from "@/utils/imageProcessor";
import { SlidersHorizontal, Image, FileImage, FileText, File } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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

  const handleImageSelected = (file: File | File[]) => {
    // Handle single file uploads
    const singleFile = Array.isArray(file) ? file[0] : file;
    
    // Create URL for the file
    const imageUrl = URL.createObjectURL(singleFile);
    setOriginalImage({ file: singleFile, url: imageUrl });
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
              <h1 className="text-xl font-bold">Image Resizer</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} />
                <span className="text-sm text-muted-foreground">Image Compressor</span>
              </div>
              <Link to="/converter">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <FileImage size={16} />
                  Format Converter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Compress Images to Your Target Size</h2>
            <p className="text-muted-foreground">
              Upload an image, set your desired file size, and we'll optimize it while maintaining quality
            </p>
          </div>

          {/* Conversion Options - Made more prominent */}
          <div className="bg-white border rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-lg mb-4">Popular Conversions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link to="/converter?tab=pdf-to-images" className="block">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border rounded-lg p-4 text-center hover:border-primary hover:shadow-md transition-all">
                  <div className="flex justify-center mb-3">
                    <FileText size={36} className="text-primary" />
                  </div>
                  <h3 className="font-medium">PDF to Images</h3>
                  <p className="text-xs text-muted-foreground mt-1">Convert PDF pages to images</p>
                </div>
              </Link>
              
              <Link to="/converter?tab=images-to-pdf" className="block">
                <div className="bg-gradient-to-br from-green-50 to-teal-50 border rounded-lg p-4 text-center hover:border-primary hover:shadow-md transition-all">
                  <div className="flex justify-center mb-3">
                    <FileImage size={36} className="text-primary" />
                  </div>
                  <h3 className="font-medium">Images to PDF</h3>
                  <p className="text-xs text-muted-foreground mt-1">Combine images into a PDF</p>
                </div>
              </Link>
              
              <Link to="/converter?tab=pdf-to-docx" className="block">
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 border rounded-lg p-4 text-center hover:border-primary hover:shadow-md transition-all">
                  <div className="flex justify-center mb-3">
                    <File size={36} className="text-primary" />
                  </div>
                  <h3 className="font-medium">PDF to DOCX</h3>
                  <p className="text-xs text-muted-foreground mt-1">Convert PDF to Word document</p>
                </div>
              </Link>
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border rounded-lg p-4 text-center hover:border-primary hover:shadow-md transition-all">
                <div className="flex justify-center mb-3">
                  <SlidersHorizontal size={36} className="text-primary" />
                </div>
                <h3 className="font-medium">Image Compressor</h3>
                <p className="text-xs text-muted-foreground mt-1">Reduce image file size</p>
              </div>
            </div>
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
          <p>Image Resizer & Compressor - Optimize your images with precision</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
