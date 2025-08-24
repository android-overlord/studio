// Generate 312 placeholder image URLs
export const images = Array.from(
  { length: 312 },
  (_, i) => `https://placehold.co/400x400.png?text=Image+${i + 1}`
);
