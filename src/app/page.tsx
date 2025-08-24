import { ImageGrid } from '@/components/image-grid';
import { images } from '@/lib/images';

export default function Home() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <ImageGrid images={images} />
    </main>
  );
}
