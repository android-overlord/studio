'use client';

import perfumeData from '@/app/perfume-quiz/perfume_database_expert_balanced.json';
import perfumeImages from '@/images.json';
import { slugify } from '@/lib/utils';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/components/ui/use-toast';

type ProductPageProps = {
  params: {
    slug: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const imagesMap = perfumeImages as Record<string, string>;

  const perfume = perfumeData.find(p => slugify(p.name) === params.slug);

  if (!perfume) {
    notFound();
  }

  const handleAddToCart = () => {
    addItem(perfume);
    toast({
      title: "Added to cart",
      description: `${perfume.name} has been added to your cart.`,
    });
  };

  const imagePath = Object.keys(imagesMap).find(key => imagesMap[key] === perfume.name);
  const imageUrl = imagePath ? `/images/${imagePath}` : `https://picsum.photos/seed/${perfume.name}/600/600`;
  
  const details = [
    { label: 'Family', value: perfume.family },
    { label: 'Intensity', value: perfume.intensity },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="flex items-center justify-center">
            <div className="aspect-square w-full max-w-md bg-neutral-800 rounded-lg flex items-center justify-center p-4 shadow-2xl">
                <Image
                    src={imageUrl}
                    alt={perfume.name}
                    width={500}
                    height={500}
                    className="rounded-lg object-contain h-full w-full"
                />
            </div>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{perfume.name}</h1>
          <div className="mt-2 mb-4">
            <span className="text-2xl font-semibold text-blue-400">₹{perfume.price.toFixed(2)}</span>
            <span className="text-sm text-neutral-400 ml-1">/ 100ml</span>
          </div>
          
          <div className="space-y-4 my-4">
              {details.map(detail => (
                  <div key={detail.label} className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-400">{detail.label}:</span>
                      <Badge variant="secondary">{detail.value}</Badge>
                  </div>
              ))}
          </div>

          {perfume.personality.length > 0 && (
            <div className="my-4">
              <h3 className="font-semibold text-neutral-400 mb-2">Personality</h3>
              <div className="flex flex-wrap gap-2">
                {perfume.personality.map(p => <Badge key={p} variant="outline">{p}</Badge>)}
              </div>
            </div>
          )}

          {perfume.occasions.length > 0 && (
            <div className="my-4">
              <h3 className="font-semibold text-neutral-400 mb-2">Occasions</h3>
              <div className="flex flex-wrap gap-2">
                {perfume.occasions.map(o => <Badge key={o} variant="outline">{o}</Badge>)}
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={handleAddToCart}
              className="w-full inline-flex items-center justify-center py-3 px-6 font-semibold rounded-full shadow-lg transition-colors duration-300 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
