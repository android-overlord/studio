import { Sparkles } from 'lucide-react';
import type { FC } from 'react';

const Header: FC = () => {
  return (
    <header className="py-8 px-4 sm:px-6 lg:px-8 text-center">
      <div className="flex items-center justify-center gap-4">
        <Sparkles className="h-12 w-12 text-accent" />
        <h1 className="font-display text-6xl sm:text-7xl font-bold tracking-tight text-foreground">
          PDF Pixi Pals
        </h1>
        <Sparkles className="h-12 w-12 text-accent" />
      </div>
      <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground font-display">
        Transform your PDFs into a whimsical gallery of images with friendly Pixi Pals!
      </p>
    </header>
  );
};

export default Header;
