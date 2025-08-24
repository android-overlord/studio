'use client';

import { type FC } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PixiPal } from '@/ai/flows/generate-pixi-pals';
import { Wand2 } from 'lucide-react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';


const PalCard: FC<{ pal: PixiPal }> = ({ pal }) => {

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pal.imageUrl) return;
    const link = document.createElement('a');
    link.href = pal.imageUrl;
    link.download = `pixi-pal-${pal.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="flex flex-col overflow-hidden bg-secondary/50 border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg">
      <CardHeader className="p-4">
        <div className="aspect-square relative w-full rounded-lg overflow-hidden border-2" style={{borderColor: pal.color}}>
          {pal.imageUrl ? (
            <Image
              src={pal.imageUrl}
              alt={`Image of ${pal.name}`}
              fill
              className="object-contain bg-white"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
                <Skeleton className="w-full h-full" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-display text-2xl text-primary">{pal.name}</CardTitle>
        <CardDescription className="mt-2">{pal.backstory}</CardDescription>
      </CardContent>
      <CardFooter className='p-4'>
        <Button onClick={handleDownload} disabled={!pal.imageUrl} className='w-full'>
            <Download className="mr-2 h-4 w-4" />
            Download
        </Button>
      </CardFooter>
    </Card>
  );
};

const PalCardSkeleton: FC<{color: string}> = ({color}) => {
    return (
        <Card className="flex flex-col overflow-hidden bg-secondary/50 border-primary/20">
            <CardHeader className="p-4">
                <Skeleton className={cn("aspect-square relative w-full rounded-lg overflow-hidden border-2", color)} />
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <Skeleton className="h-8 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
            <CardFooter className='p-4'>
                <Skeleton className='h-10 w-full' />
            </CardFooter>
        </Card>
    )
}

const skeletonColors = [
    'border-red-500/50',
    'border-blue-500/50',
    'border-green-500/50',
    'border-yellow-500/50',
]

interface PixiPalsGalleryProps {
  pals: PixiPal[];
  isLoading: boolean;
}

const PixiPalsGallery: FC<PixiPalsGalleryProps> = ({ pals, isLoading }) => {
    if (isLoading === false && pals.length === 0) {
        return null;
    }
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Wand2 className="h-6 w-6 text-primary" />
        <h2 className="font-display text-3xl font-bold">Meet the Pixi Pals</h2>
      </div>
       <p className="text-muted-foreground mb-6 max-w-2xl">
        Based on your document, we've summoned some Pixi Pals to help you out! These magical creatures are created by AI and inspired by the content of your PDF.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading && [1,2,3,4].map((i) => <PalCardSkeleton key={i} color={skeletonColors[i-1]} />)}
        {!isLoading && pals.map((pal, index) => <PalCard key={index} pal={pal} />)}
      </div>
    </div>
  );
};

export default PixiPalsGallery;
