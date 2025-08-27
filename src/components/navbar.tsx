'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

export function Navbar() {
  const { cart } = useCart();
  const itemCount = cart.length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold tracking-tighter">
            CRESKI
          </a>
          <nav className="ml-10 hidden md:flex space-x-4">
            <a href="/start-quiz" className="text-neutral-300 hover:text-white">Perfume Quiz</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/checkout" className="relative text-neutral-300 hover:text-white">
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
