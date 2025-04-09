
import { toast } from "@/hooks/use-toast";
import { pdfjs } from "./pdfJsInit";

// Function to convert a PDF file to an array of image blobs
export async function pdfToImages(file: File): Promise<Blob[]> {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Ensure pdfjs is properly initialized
    if (!pdfjs) {
      console.error("PDF.js not properly initialized");
      throw new Error("PDF.js library not available");
    }
    
    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    
    console.log(`PDF loaded with ${numPages} pages`);
    
    // Array to store the converted images
    const images: Blob[] = [];
    
    // Convert each page to an image
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      
      // Create a canvas to render the page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not create canvas context');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render the page to the canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      console.log(`Rendered page ${i} to canvas`);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            toast({
              title: "Error",
              description: "Failed to convert PDF page to image",
              variant: "destructive",
            });
            resolve(new Blob([]));
          }
        }, 'image/png');
      });
      
      images.push(blob);
      console.log(`Added blob for page ${i}, size: ${blob.size} bytes`);
    }
    
    console.log(`Returning ${images.length} images`);
    return images;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    toast({
      title: "Conversion failed",
      description: "There was an error converting your PDF to images",
      variant: "destructive",
    });
    return [];
  }
}

// Function to convert multiple image files into a single PDF
export async function imagesToPdf(images: File[]): Promise<Blob | null> {
  try {
    // Import PDFDocument from pdf-lib (needs to be installed)
    const { PDFDocument, rgb } = await import('pdf-lib');
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Process each image and add it to the PDF
    for (const image of images) {
      // Create an image URL
      const imageUrl = URL.createObjectURL(image);
      
      // Create an HTML image element to get dimensions
      const imgElement = document.createElement('img');
      await new Promise((resolve) => {
        imgElement.onload = resolve;
        imgElement.src = imageUrl;
      });
      
      // Convert image to bytes
      const imageBytes = await image.arrayBuffer();
      
      let pdfImage;
      
      // Determine image type and embed it in the PDF
      if (image.type === 'image/jpeg' || image.type === 'image/jpg') {
        pdfImage = await pdfDoc.embedJpg(imageBytes);
      } else if (image.type === 'image/png') {
        pdfImage = await pdfDoc.embedPng(imageBytes);
      } else {
        // For unsupported types, try to use PNG as fallback
        pdfImage = await pdfDoc.embedPng(imageBytes);
      }
      
      // Add a page with the dimensions of the image
      const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
      
      // Draw the image on the page
      page.drawImage(pdfImage, {
        x: 0,
        y: 0,
        width: pdfImage.width,
        height: pdfImage.height,
      });
      
      // Clean up
      URL.revokeObjectURL(imageUrl);
    }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error converting images to PDF:', error);
    toast({
      title: "Conversion failed",
      description: "There was an error converting your images to PDF",
      variant: "destructive",
    });
    return null;
  }
}

// Function to convert PDF to DOCX using Mammoth.js
export async function pdfToDocx(pdfFile: File): Promise<Blob | null> {
  try {
    // First convert PDF to HTML content
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    
    let textContent = '';
    
    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      const pageText = text.items.map((item: any) => item.str).join(' ');
      textContent += pageText + '\n\n';
    }
    
    // Create a simple DOCX format (this is a simple representation, not actual DOCX)
    const docxBlob = new Blob([textContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    
    return docxBlob;
  } catch (error) {
    console.error('Error converting PDF to DOCX:', error);
    toast({
      title: "Conversion failed",
      description: "There was an error converting your PDF to DOCX",
      variant: "destructive",
    });
    return null;
  }
}

export function getFileNameWithExtension(originalName: string, newExtension: string): string {
  const nameParts = originalName.split('.');
  // Remove the original extension
  nameParts.pop();
  // Join the name parts and add new extension
  return `${nameParts.join('.')}.${newExtension}`;
}
