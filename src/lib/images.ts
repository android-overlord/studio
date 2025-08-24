// Generate 312 image paths pointing to the public/images directory.
// This assumes the images are named 1.jpg, 2.jpg, 3.jpg, and so on.
export const images = Array.from(
  { length: 312 }, (_, i) => `/images/extracted-image-${i + 1}.png`
);