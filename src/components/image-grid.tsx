'use client';

import { type FC, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ImageGridProps {
  images: string[];
}

const ImageItem: FC<{ src: string, index: number }> = ({ src, index }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="break-inside-avoid group">
       <Card className="overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:scale-105">
         <CardContent className="p-0 relative">
            {isLoading && <Skeleton className="absolute inset-0 h-full w-full" />}
            <Image
              src={src}
              alt={`Extracted image ${index + 1}`}
              width={500}
              height={500}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              className={cn("h-auto w-full object-cover bg-white transition-opacity duration-500", isLoading ? "opacity-0" : "opacity-100")}
              data-ai-hint="gallery photo"
              onLoad={() => setIsLoading(false)}
            />
         </CardContent>
       </Card>
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
