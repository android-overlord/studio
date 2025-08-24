import { FileImage } from 'lucide-react';
import type { FC } from 'react';

const Header: FC = () => {
  return (
    <header className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center gap-4 text-center">
        <FileImage className="h-10 w-10 text-primary" />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          PDF Image Xtractor
        </h1>
      </div>
      <p className="mt-4 max-w-2xl mx-auto text-center text-lg text-muted-foreground">
        Upload your PDF and we'll extract every image into a beautiful, seamless gallery for you.
      </p>
    </header>
  );
};

export default Header;
