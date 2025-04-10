
import * as pdfjs from 'pdfjs-dist';

// Set the worker source path
const pdfjsWorker = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Make sure pdfjs is available
console.log("PDF.js initialized with version:", pdfjs.version);

// Export the configured pdfjs for use elsewhere
export { pdfjs };

// Create a promise to track when pdfjs is fully loaded
let pdfJsLoadedResolve: () => void;
const pdfJsLoaded = new Promise<void>(resolve => {
  pdfJsLoadedResolve = resolve;
});

// Add to window object to make it globally available
declare global {
  interface Window {
    pdfjsLib: typeof pdfjs;
  }
}

window.pdfjsLib = pdfjs;

// Load the worker script dynamically
const workerScript = document.createElement('script');
workerScript.src = pdfjsWorker;
workerScript.onload = () => {
  console.log("PDF.js worker loaded successfully");
  pdfJsLoadedResolve();
};
document.head.appendChild(workerScript);

export { pdfJsLoaded };
