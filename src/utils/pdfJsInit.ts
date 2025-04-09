
import * as pdfjs from 'pdfjs-dist';

// Set the worker source path
const pdfjsWorker = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Export the configured pdfjs for use elsewhere
export { pdfjs };

// Add to window object to make it globally available
declare global {
  interface Window {
    pdfjsLib: typeof pdfjs;
  }
}

window.pdfjsLib = pdfjs;
