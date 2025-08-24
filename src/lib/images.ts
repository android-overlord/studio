// Generate 312 image paths assuming they are in the public/images directory
export const images = Array.from(
  { length: 312 },
  (_, i) => `/images/image-${i + 1}.jpg`
);
