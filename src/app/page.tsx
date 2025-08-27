import { ImageGrid } from '@/components/image-grid';
import perfumeData from './perfume-quiz/perfume_database_expert_balanced.json';
import perfumeImages from '@/images.json';
import { slugify } from '@/lib/utils';

export type Perfume = {
  name: string;
  family: string;
  personality: string[];
  occasions: string[];
  intensity: string;
  price: number;
  image: string;
  slug: string;
};

export default function Home() {
  const imagesMap = perfumeImages as Record<string, string>;
  const imageNameToPath: { [key: string]: string } = {};
  for (const path in imagesMap) {
    const perfumeName = imagesMap[path];
    imageNameToPath[perfumeName] = `/images/${path}`;
  }

  const perfumesWithImages: Perfume[] = perfumeData.map(perfume => ({
    ...perfume,
    image: imageNameToPath[perfume.name] || `https://picsum.photos/seed/${perfume.name}/400/400`,
    slug: slugify(perfume.name),
  })).filter(p => p.image);

  // Remove duplicates by name, keeping the first one.
  const uniquePerfumes = perfumesWithImages.reduce((acc, current) => {
    if (!acc.find(item => item.slug === current.slug)) {
      acc.push(current);
    }
    return acc;
  }, [] as Perfume[]);


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 sm:p-6 lg:p-8">
      {/* Perfume Quiz Call to Action */}
      <section className="w-full text-center py-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Not sure which scent is for you?</h2>
        <p className="text-lg mb-6">Take our personalized quiz to find your perfect match!</p>
        <a
          href="/start-quiz"
          className="inline-block px-8 py-3 text-lg font-semibold text-purple-700 bg-white rounded-full shadow hover:bg-gray-100 transition duration-300"
        >
          Take the Quiz
        </a>
      </section>

      <ImageGrid perfumes={uniquePerfumes} />
    </main>
  );
}
