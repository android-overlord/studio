import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-neutral-900 border-t border-neutral-800 py-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left text-neutral-400">
        <p className="text-sm mb-4 md:mb-0">
          &copy; {currentYear} CRESKI. All rights reserved.
        </p>
        <nav className="flex space-x-4">
          <Link href="/terms-of-service" className="text-sm hover:text-white transition-colors">
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
