'use client';

import { type FC, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Download } from 'lucide-react';
import { Button } from './ui/button';

interface ImageGridProps {
  images: string[];
}

const ImageItem: FC<{ src: string, index: number }> = ({ src, index }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = src;
    link.download = `pixi-pal-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="break-inside-avoid group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
       <Card className="overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:scale-105 border-2 border-transparent hover:border-primary/50">
         <CardContent className="p-0 relative bg-card">
            {isLoading && <Skeleton className="absolute inset-0 h-full w-full bg-muted" />}
            <Image
              src={src}
              alt={`Extracted image ${index + 1}`}
              width={500}
              height={500}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              className={cn("h-auto w-full object-contain bg-white transition-opacity duration-500", isLoading ? "opacity-0" : "opacity-100")}
              onLoad={() => setIsLoading(false)}
            />
         </CardContent>
       </Card>
       {isHovered && !isLoading && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 z-10 bg-black/50 hover:bg-black/80 text-white"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}


const ImageGrid: FC<ImageGridProps> = ({ images }) => {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
      {images.map((src, index) => (
        <ImageItem key={index} src={src} index={index} />
      ))}
    </div>
  );
};

export default ImageGrid;
