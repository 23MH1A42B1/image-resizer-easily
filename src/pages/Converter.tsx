import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import UploadArea from "@/components/UploadArea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pdfToImages, imagesToPdf, getFileNameWithExtension } from "@/utils/pdfConverter";
import { FileText, FileImage, FileDown, Loader2 } from "lucide-react";

const Converter = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [outputImages, setOutputImages] = useState<Blob[]>([]);
  const [outputPdf, setOutputPdf] = useState<Blob | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePdfSelected = (file: File) => {
    setPdfFile(file);
    setOutputImages([]);
  };

  const handleImageSelected = (file: File) => {
    setImageFiles((prev) => [...prev, file]);
    setOutputPdf(null);
  };

  const handlePdfToImages = async () => {
    if (!pdfFile) return;
    
    setIsConverting(true);
    try {
      const images = await pdfToImages(pdfFile);
      setOutputImages(images);
      
      toast({
        title: "Conversion successful",
        description: `Converted ${images.length} pages to images`,
      });
    } catch (error) {
      console.error("Error in PDF to images conversion:", error);
      toast({
        title: "Conversion failed",
        description: "There was an error processing your PDF",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleImagesToPdf = async () => {
    if (imageFiles.length === 0) return;
    
    setIsConverting(true);
    try {
      const pdfBlob = await imagesToPdf(imageFiles);
      if (pdfBlob) {
        setOutputPdf(pdfBlob);
        
        toast({
          title: "Conversion successful",
          description: `Created PDF with ${imageFiles.length} images`,
        });
      }
    } catch (error) {
      console.error("Error in images to PDF conversion:", error);
      toast({
        title: "Conversion failed",
        description: "There was an error creating your PDF",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadImages = () => {
    if (outputImages.length === 0 || !pdfFile) return;
    
    setIsDownloading(true);
    try {
      outputImages.forEach((blob, index) => {
        const fileName = `${pdfFile.name.replace('.pdf', '')}_page_${index + 1}.png`;
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      });
      
      toast({
        title: "Download started",
        description: `Downloading ${outputImages.length} images`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading your images",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!outputPdf || imageFiles.length === 0) return;
    
    setIsDownloading(true);
    try {
      const fileName = imageFiles.length === 1 
        ? getFileNameWithExtension(imageFiles[0].name, 'pdf')
        : `converted_images_${new Date().getTime()}.pdf`;
      
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(outputPdf);
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
        description: "There was an error downloading your PDF",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(files => files.filter((_, i) => i !== index));
    setOutputPdf(null);
  };

  const resetPdfToImages = () => {
    setPdfFile(null);
    setOutputImages([]);
  };

  const resetImagesToPdf = () => {
    setImageFiles([]);
    setOutputPdf(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileImage size={24} className="text-primary" />
              <h1 className="text-xl font-bold">File Format Converter</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Convert Between Images and PDF</h2>
            <p className="text-muted-foreground">
              Convert your PDFs to images or combine multiple images into a single PDF file
            </p>
          </div>

          <Tabs defaultValue="pdf-to-images" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="pdf-to-images" className="flex gap-2 items-center">
                <FileText size={18} />
                PDF to Images
              </TabsTrigger>
              <TabsTrigger value="images-to-pdf" className="flex gap-2 items-center">
                <FileImage size={18} />
                Images to PDF
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pdf-to-images" className="space-y-6">
              {!pdfFile ? (
                <UploadArea 
                  onImageSelected={handlePdfSelected} 
                  acceptedTypes={["application/pdf"]}
                  maxSizeMB={20}
                  title="Drag and drop your PDF here"
                  subtitle="or click to browse (Max size: 20MB)"
                />
              ) : (
                <div className="space-y-6">
                  <div className="bg-white p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FilePdf size={32} className="text-red-500" />
                      <div className="flex-1">
                        <p className="font-medium">{pdfFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={resetPdfToImages}
                    >
                      Choose Different PDF
                    </Button>
                    <Button 
                      onClick={handlePdfToImages}
                      disabled={isConverting}
                      className="flex gap-2 items-center"
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          Convert to Images
                        </>
                      )}
                    </Button>
                  </div>

                  {outputImages.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Output Images ({outputImages.length})</h3>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {outputImages.map((blob, index) => (
                          <div key={index} className="border rounded-md overflow-hidden bg-white">
                            <div className="aspect-square overflow-hidden">
                              <img 
                                src={URL.createObjectURL(blob)} 
                                alt={`Page ${index + 1}`} 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="p-2 text-center text-sm">
                              Page {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center mt-4">
                        <Button 
                          onClick={handleDownloadImages} 
                          disabled={isDownloading}
                          className="flex gap-2 items-center"
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className="animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <FileDown size={16} />
                              Download All Images
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="images-to-pdf" className="space-y-6">
              <div className="space-y-6">
                {imageFiles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Selected Images ({imageFiles.length})</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="border rounded-md overflow-hidden bg-white relative group">
                          <div className="aspect-square overflow-hidden">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={file.name} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="p-2 text-sm">
                            <div className="truncate">{file.name}</div>
                            <div className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(0)} KB
                            </div>
                          </div>
                          <button 
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <UploadArea
                  onImageSelected={handleImageSelected}
                  acceptedTypes={["image/jpeg", "image/png", "image/gif", "image/webp"]}
                  title={imageFiles.length > 0 ? "Add more images" : "Drag and drop your images here"}
                  subtitle="or click to browse (JPEG, PNG, GIF, WEBP)"
                />

                {imageFiles.length > 0 && (
                  <div className="flex gap-4 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={resetImagesToPdf}
                    >
                      Clear All Images
                    </Button>
                    <Button 
                      onClick={handleImagesToPdf}
                      disabled={isConverting || imageFiles.length === 0}
                      className="flex gap-2 items-center"
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Creating PDF...
                        </>
                      ) : (
                        <>
                          Create PDF
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {outputPdf && (
                  <div className="mt-6 flex justify-center">
                    <Button 
                      onClick={handleDownloadPdf}
                      disabled={isDownloading}
                      className="flex gap-2 items-center"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <FileDown size={16} />
                          Download PDF
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="mt-auto py-6 border-t bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>File Format Converter - Convert between PDF and image formats</p>
        </div>
      </footer>
    </div>
  );
};

export default Converter;
