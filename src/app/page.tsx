'use client';

import { useState } from 'react';
import Header from '@/components/header';
import PdfUploader from '@/components/pdf-uploader';
import ImageGrid from '@/components/image-grid';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sparkles, UploadCloud } from 'lucide-react';
import { processPdf } from './actions';
import { PixiPal } from '@/ai/flows/generate-pixi-pals';
import PixiPalsGallery from '@/components/pixi-pals-gallery';

type AppState = 'initial' | 'loading' | 'results';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('initial');
  const [images, setImages] = useState<string[]>([]);
  const [pals, setPals] = useState<PixiPal[]>([]);
  const [palsLoading, setPalsLoading] = useState(false);
  const { toast } = useToast();

  const handlePdfUpload = async (file: File) => {
    setAppState('loading');
    setPalsLoading(true);
    setImages([]);
    setPals([]);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const pdfDataUri = reader.result as string;
      try {
        const result = await processPdf(pdfDataUri);
        
        if (result.error && !result.images?.length) {
          throw new Error(result.error);
        }

        if (result.images && result.images.length > 0) {
          setImages(result.images);
          setAppState('results');
        } else {
           toast({
            variant: "default",
            title: "No Images Found",
            description: "We couldn't find any images in this PDF, but check out the Pixi-Pals we made for you!",
          });
        }
        
        if(result.palsPromise) {
          const palsResult = await result.palsPromise;
          if(palsResult.pals.length > 0){
            setAppState('results');
            setPals(palsResult.pals);
          }
          setPalsLoading(false);
        } else {
          setPalsLoading(false);
        }

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Oh no! Something went wrong.',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
        setAppState('initial');
        setPalsLoading(false);
      }
    };
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'There was an error reading the selected file.',
      });
      setAppState('initial');
    };
  };

  const handleReset = () => {
    setAppState('initial');
    setImages([]);
    setPals([]);
  };

  const isLoading = appState === 'loading';

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
      <div
        className="fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, hsl(var(--primary) / 0.1), transparent 60%)',
        }}
      />
      <main className="container relative z-10 mx-auto px-4 py-8">
        {appState !== 'results' ? (
          <div className='flex flex-col items-center justify-center min-h-[80vh]'>
            <Header />
            <div className="mt-12 w-full max-w-2xl">
              <PdfUploader onUpload={handlePdfUpload} isLoading={isLoading} />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <h1 className="font-display text-4xl font-bold text-primary">Your Magical Gallery</h1>
              <Button variant="ghost" onClick={handleReset} className="text-primary hover:text-primary hover:bg-primary/10">
                <UploadCloud className="mr-2 h-4 w-4" />
                Start Over
              </Button>
            </div>
            
            <PixiPalsGallery pals={pals} isLoading={palsLoading} />

            {images.length > 0 && (
              <>
                <div className="flex items-center gap-3 my-8">
                   <Sparkles className="h-6 w-6 text-accent" />
                   <h2 className="font-display text-3xl font-bold">Extracted Images</h2>
                </div>
                <ImageGrid images={images} />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
