'use client';

import { type FC, useState, useRef, type DragEvent, useEffect } from 'react';
import { Sparkles, Loader2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PdfUploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

const loadingMessages = [
  "Summoning Pixi helpers...",
  "Analyzing your document...",
  "Extracting enchanting images...",
  "Searching for hidden wonders...",
  "Painting with digital watercolors...",
  "Nearly there, adding extra sparkle!"
];

const PdfUploader: FC<PdfUploaderProps> = ({ onUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          return loadingMessages[(currentIndex + 1) % loadingMessages.length];
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileValidation = (file: File | undefined) => {
    if (!file) return false;
    if (file.type !== 'application/pdf') {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Oops! Only PDF files are allowed.',
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
        'relative flex flex-col items-center justify-center w-full max-w-3xl mx-auto p-8 sm:p-12 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out',
        isLoading ? 'cursor-wait border-primary/50' : 'cursor-pointer',
        isDragging ? 'border-primary bg-primary/10 scale-105' : 'border-border hover:border-primary/50 hover:bg-primary/5'
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
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
          <p className="text-xl font-medium text-foreground font-display">{loadingMessage}</p>
          <p className="text-muted-foreground mt-2">Please wait, magic is happening!</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <UploadCloud className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl font-semibold text-foreground font-display">Drop your PDF here</h3>
          <p className="text-muted-foreground mt-2 font-display text-lg">or</p>
          <Button variant="outline" className="mt-4 pointer-events-none bg-secondary text-secondary-foreground hover:bg-secondary/90">
             Choose a File
          </Button>
          <p className="text-xs text-muted-foreground mt-6">Only .pdf files please!</p>
        </div>
      )}
       <Sparkles className="absolute -top-3 -right-3 h-8 w-8 text-accent opacity-50 rotate-12" />
       <Sparkles className="absolute -bottom-4 -left-2 h-6 w-6 text-primary opacity-30 -rotate-12" />
    </div>
  );
};

export default PdfUploader;
