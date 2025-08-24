'use client';

import { useState } from 'react';
import Header from '@/components/header';
import PdfUploader from '@/components/pdf-uploader';
import ImageGrid from '@/components/image-grid';
import { getImagesFromPdf } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePdfUpload = async (file: File) => {
    setIsLoading(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const pdfDataUri = reader.result as string;
      try {
        const result = await getImagesFromPdf(pdfDataUri);
        if (result.error) {
          throw new Error(result.error);
        }
        if (result.images && result.images.length > 0) {
          setImages(result.images);
        } else {
          toast({
            variant: "default",
            title: "No Images Found",
            description: "We couldn't find any images in the uploaded PDF.",
          });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'There was an error reading the selected file.',
      });
      setIsLoading(false);
    };
  };

  const handleReset = () => {
    setImages([]);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {images.length === 0 ? (
          <>
            <Header />
            <div className="mt-8">
              <PdfUploader onUpload={handlePdfUpload} isLoading={isLoading} />
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <h1 className="text-3xl font-bold">Your Extracted Images</h1>
              <Button variant="ghost" onClick={handleReset} className="text-primary hover:text-primary hover:bg-primary/10">
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload New PDF
              </Button>
            </div>
            <ImageGrid images={images} />
          </div>
        )}
      </div>
    </main>
  );
}
