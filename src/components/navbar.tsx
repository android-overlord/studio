'use client';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold tracking-tighter">
            CRESKI
          </a>
        </div>
      </div>
    </header>
  );
}
