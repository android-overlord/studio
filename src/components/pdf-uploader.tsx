'use client';

import { type FC, useState, useRef, type DragEvent } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PdfUploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

const PdfUploader: FC<PdfUploaderProps> = ({ onUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileValidation = (file: File | undefined) => {
    if (!file) return false;
    if (file.type !== 'application/pdf') {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a valid PDF file.',
      });
      return false;
    }
    return true;
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (handleFileValidation(file)) {
        onUpload(file);
      }
    }
  };

  const handleClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (handleFileValidation(file)) {
        onUpload(file);
      }
      e.target.value = '';
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        'relative flex flex-col items-center justify-center w-full max-w-3xl mx-auto p-8 sm:p-12 border-2 border-dashed rounded-lg transition-colors duration-300 ease-in-out',
        isLoading ? 'cursor-not-allowed' : 'cursor-pointer',
        isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="application/pdf"
        onChange={handleChange}
        disabled={isLoading}
      />
      {isLoading ? (
        <div className="flex flex-col items-center justify-center text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-lg font-medium text-foreground">Extracting Images...</p>
          <p className="text-muted-foreground">Please wait, this may take a moment.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground">Drag & Drop PDF here</h3>
          <p className="text-muted-foreground mt-2">or</p>
          <Button variant="outline" className="mt-4 pointer-events-none bg-accent text-accent-foreground">
            Browse Files
          </Button>
          <p className="text-xs text-muted-foreground mt-4">Only .pdf files are accepted</p>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
