
import React, { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface UploadAreaProps {
  onImageSelected: (file: File) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
}

const UploadArea: React.FC<UploadAreaProps> = ({ 
  onImageSelected, 
  acceptedTypes = ["image/*"],
  maxSizeMB = 10,
  title = "Drag and drop your image here",
  subtitle = "or click to browse (JPEG, PNG, etc.)"
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  }, []);

  const handleFiles = (files: FileList) => {
    if (files.length === 0) return;

    const file = files[0];
    
    // Check if the file type is accepted
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(`${baseType}/`);
      }
      return file.type === type;
    });

    if (!isAccepted) {
      toast({
        title: "Invalid file type",
        description: `Please select a valid file type (${acceptedTypes.join(", ")})`,
        variant: "destructive",
      });
      return;
    }

    // File size check
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please select a file smaller than ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return;
    }

    onImageSelected(file);
  };

  const acceptAttribute = acceptedTypes.join(",");

  return (
    <div
      className={cn(
        "drop-area border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
        "transition-all hover:border-primary/50",
        isDragging ? "drop-area-active animate-pulse-border" : "border-gray-200"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById("fileInput")?.click()}
    >
      <input
        id="fileInput"
        type="file"
        className="hidden"
        accept={acceptAttribute}
        onChange={handleFileInput}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-primary/10 p-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-medium text-gray-700">
            {title}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;
