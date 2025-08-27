import Link from 'next/link';

export default function StartQuizPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">
        Discover Your Signature Scent
      </h1>

      <p className="text-lg md:text-xl mb-8 max-w-2xl px-4">
        Take our personalized quiz to explore a curated selection of perfumes and find the perfect fragrance that matches your personality, style, and preferences.
      </p>

      <Link href="/perfume-quiz" passHref>
        <button className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
          Start Quiz
        </button>
      </Link>
    </div>
  );
}
