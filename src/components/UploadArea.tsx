
import React, { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface UploadAreaProps {
  onImageSelected: (file: File | File[]) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
  multiple?: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ 
  onImageSelected, 
  acceptedTypes = ["image/*"],
  maxSizeMB = 10,
  title = "Drag and drop your image here",
  subtitle = "or click to browse (JPEG, PNG, etc.)",
  multiple = false
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

    // For single file uploads
    if (!multiple) {
      const file = files[0];
      validateAndProcessFile(file);
      return;
    }
    
    // For multiple file uploads
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (isValidFile(file)) {
        validFiles.push(file);
      }
    }
    
    if (validFiles.length > 0) {
      onImageSelected(validFiles);
    }
  };
  
  const validateAndProcessFile = (file: File): boolean => {
    if (isValidFile(file)) {
      onImageSelected(file);
      return true;
    }
    return false;
  };
  
  const isValidFile = (file: File): boolean => {
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
      return false;
    }

    // File size check
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please select a file smaller than ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
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
        multiple={multiple}
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
