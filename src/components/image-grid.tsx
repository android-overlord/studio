import Link from 'next/link';
import { Perfume } from '@/app/page';


type ImageGridProps = {
  perfumes: Perfume[];
};

export function ImageGrid({ perfumes }: ImageGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {perfumes.map((perfume) => (
        <Link key={perfume.slug} href={`/product/${perfume.slug}`} className="group relative aspect-square overflow-hidden bg-neutral-800">
          <img
            src={perfume.image}
            alt={perfume.name}
            className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            width={400}
            height={400}
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-2">
            <div className="text-center text-white">
              <p className="font-semibold text-sm">{perfume.name}</p>
              <p className="text-md font-bold">₹{perfume.price.toFixed(2)}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
