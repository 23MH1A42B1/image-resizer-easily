
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import UploadArea from "@/components/UploadArea";
import { FileImage, FileText, ArrowLeft, FileWord } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { imagesToPdf, pdfToImages, pdfToDocx, getFileNameWithExtension } from "@/utils/pdfConverter";

const Converter = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [convertedImages, setConvertedImages] = useState<Blob[]>([]);
  const [convertedPdf, setConvertedPdf] = useState<Blob | null>(null);
  const [convertedDocx, setConvertedDocx] = useState<Blob | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionType, setConversionType] = useState<'pdf-to-images' | 'images-to-pdf' | 'pdf-to-docx'>('pdf-to-images');

  const handlePdfUpload = (file: File | File[]) => {
    const singleFile = Array.isArray(file) ? file[0] : file;
    setPdfFile(singleFile);
    setConvertedImages([]);
    setConvertedDocx(null);
  };

  const handleImageUpload = (file: File | File[]) => {
    const fileArray = Array.isArray(file) ? file : [file];
    setImages(fileArray);
    setConvertedPdf(null);
  };

  const handleConvertPdfToImages = async () => {
    if (!pdfFile) return;

    setIsConverting(true);
    try {
      const images = await pdfToImages(pdfFile);
      setConvertedImages(images);

      toast({
        title: "PDF converted to images!",
        description: `Successfully converted PDF to ${images.length} images.`,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description: "There was an error processing your PDF",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleConvertPdfToDocx = async () => {
    if (!pdfFile) return;

    setIsConverting(true);
    try {
      const docxBlob = await pdfToDocx(pdfFile);
      setConvertedDocx(docxBlob);

      toast({
        title: "PDF converted to DOCX!",
        description: "Successfully converted PDF to DOCX format.",
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description: "There was an error converting your PDF to DOCX",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleConvertImagesToPdf = async () => {
    if (images.length === 0) return;

    setIsConverting(true);
    try {
      const pdfBlob = await imagesToPdf(images);
      setConvertedPdf(pdfBlob);

      toast({
        title: "Images converted to PDF!",
        description: `Successfully converted ${images.length} images to PDF.`,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description: "There was an error processing your images",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!convertedPdf) return;

    const fileName = getFileNameWithExtension("converted", "pdf");
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(convertedPdf);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    toast({
      title: "Download started",
      description: `Saved as ${fileName}`,
    });
  };

  const handleDownloadDocx = () => {
    if (!convertedDocx || !pdfFile) return;

    const fileName = getFileNameWithExtension(pdfFile.name, "docx");
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(convertedDocx);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    toast({
      title: "Download started",
      description: `Saved as ${fileName}`,
    });
  };

  const handleDownloadImage = (image: Blob, index: number) => {
    const fileName = getFileNameWithExtension(`page-${index + 1}`, "png");
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(image);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    toast({
      title: "Download started",
      description: `Saved as ${fileName}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
                <ArrowLeft size={18} />
                <span>Back to Home</span>
              </Link>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <FileImage size={24} className="text-primary" />
              <h1 className="text-xl font-bold">Image Resizer</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">File Format Converter</h2>
          <p className="text-muted-foreground">Convert between different file formats with ease</p>
        </div>

        {/* Conversion Type Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setConversionType('pdf-to-images')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                conversionType === 'pdf-to-images'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              PDF to Images
            </button>
            <button
              onClick={() => setConversionType('images-to-pdf')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                conversionType === 'images-to-pdf'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              Images to PDF
            </button>
            <button
              onClick={() => setConversionType('pdf-to-docx')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                conversionType === 'pdf-to-docx'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              PDF to DOCX
            </button>
          </div>
        </div>

        {/* PDF to Images Converter */}
        {conversionType === 'pdf-to-images' && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-lg border overflow-hidden bg-white">
              <div className="p-6 bg-primary/5 border-b">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileText className="text-primary" size={20} />
                  PDF to Images
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Convert PDF pages to PNG images</p>
              </div>
              <div className="p-6">
                {!pdfFile ? (
                  <UploadArea
                    onImageSelected={handlePdfUpload}
                    acceptedTypes={[".pdf", "application/pdf"]}
                    title="Upload PDF"
                    subtitle="Click to select or drop your PDF file here"
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText size={32} className="text-red-500" />
                        <div className="flex-1">
                          <p className="font-medium">{pdfFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(pdfFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setPdfFile(null);
                          setConvertedImages([]);
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        Upload a different PDF
                      </button>
                      <Button 
                        onClick={handleConvertPdfToImages} 
                        disabled={isConverting}
                      >
                        {isConverting ? "Converting..." : "Convert to Images"}
                      </Button>
                    </div>

                    {convertedImages.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Converted Images ({convertedImages.length})</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {convertedImages.map((image, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden">
                              <img 
                                src={URL.createObjectURL(image)} 
                                alt={`Page ${index + 1}`} 
                                className="w-full h-32 object-contain bg-gray-50"
                              />
                              <div className="p-2 text-center">
                                <button
                                  onClick={() => handleDownloadImage(image, index)}
                                  className="text-xs text-primary hover:underline"
                                >
                                  Download Page {index + 1}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Images to PDF Converter */}
        {conversionType === 'images-to-pdf' && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-lg border overflow-hidden bg-white">
              <div className="p-6 bg-primary/5 border-b">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileImage className="text-primary" size={20} />
                  Images to PDF
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Combine multiple images into a single PDF</p>
              </div>
              <div className="p-6">
                {images.length === 0 ? (
                  <UploadArea
                    onImageSelected={handleImageUpload}
                    acceptedTypes={["image/*"]}
                    title="Upload Images"
                    subtitle="Click to select or drop your image files here"
                    multiple={true}
                  />
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Selected Images ({images.length})</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {images.map((image, index) => (
                          <div key={index} className="border rounded-lg overflow-hidden">
                            <img 
                              src={URL.createObjectURL(image)} 
                              alt={image.name} 
                              className="w-full h-32 object-contain bg-gray-50"
                            />
                            <div className="p-2 text-xs truncate text-center">{image.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setImages([]);
                          setConvertedPdf(null);
                          // Clean up object URLs
                          images.forEach(image => URL.revokeObjectURL(URL.createObjectURL(image)));
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        Upload different images
                      </button>
                      <Button 
                        onClick={handleConvertImagesToPdf} 
                        disabled={isConverting || images.length === 0}
                      >
                        {isConverting ? "Converting..." : "Convert to PDF"}
                      </Button>
                    </div>

                    {convertedPdf && (
                      <div className="text-center p-4 border rounded-lg">
                        <p className="mb-2">PDF created successfully!</p>
                        <Button onClick={handleDownloadPdf} size="sm">Download PDF</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* PDF to DOCX Converter */}
        {conversionType === 'pdf-to-docx' && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-lg border overflow-hidden bg-white">
              <div className="p-6 bg-primary/5 border-b">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileWord className="text-primary" size={20} />
                  PDF to DOCX
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Convert PDF files to Word documents</p>
              </div>
              <div className="p-6">
                {!pdfFile ? (
                  <UploadArea
                    onImageSelected={handlePdfUpload}
                    acceptedTypes={[".pdf", "application/pdf"]}
                    title="Upload PDF"
                    subtitle="Click to select or drop your PDF file here"
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText size={32} className="text-red-500" />
                        <div className="flex-1">
                          <p className="font-medium">{pdfFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(pdfFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setPdfFile(null);
                          setConvertedDocx(null);
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        Upload a different PDF
                      </button>
                      <Button 
                        onClick={handleConvertPdfToDocx} 
                        disabled={isConverting}
                      >
                        {isConverting ? "Converting..." : "Convert to DOCX"}
                      </Button>
                    </div>

                    {convertedDocx && (
                      <div className="text-center p-4 border rounded-lg">
                        <p className="mb-2">DOCX file created successfully!</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Note: This is a simple text extraction. For better formatting, consider using specialized software.
                        </p>
                        <Button onClick={handleDownloadDocx} size="sm">Download DOCX</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="mt-auto py-6 border-t bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Image Resizer & Converter - Optimize and convert your files with precision</p>
        </div>
      </footer>
    </div>
  );
};

export default Converter;
