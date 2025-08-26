import { ImageGrid } from '@/components/image-grid';
import { images } from '@/lib/images';

export default function Home() {
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

      <ImageGrid images={images} /> {/* Your existing ImageGrid component */}
    </main>
  );
}
