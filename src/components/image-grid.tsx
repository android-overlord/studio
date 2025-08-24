'use client';

import type { FC } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface ImageGridProps {
  images: string[];
}

const ImageGrid: FC<ImageGridProps> = ({ images }) => {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
      {images.map((src, index) => (
        <div key={index} className="break-inside-avoid group">
           <Card className="overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:scale-105">
             <CardContent className="p-0">
                <Image
                  src={src}
                  alt={`Extracted image ${index + 1}`}
                  width={500}
                  height={500}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  className="h-auto w-full object-cover bg-white"
                  data-ai-hint="gallery photo"
                />
             </CardContent>
           </Card>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
