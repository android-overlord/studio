type ImageGridProps = {
  images: string[];
};

export function ImageGrid({ images }: ImageGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {images.map((src, index) => (
        <div
          key={index}
          className="aspect-square overflow-hidden rounded-lg bg-neutral-800"
        >
          <img
            src={src}
            alt={`Image ${index + 1}`}
            className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
            width={400}
            height={400}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
