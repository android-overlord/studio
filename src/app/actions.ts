
'use server';

import { extractImagesFromPdf } from '@/ai/flows/extract-images-from-pdf';
import { generatePixiPals } from '@/ai/flows/generate-pixi-pals';

export async function processPdf(pdfDataUri: string) {
  if (!pdfDataUri.startsWith('data:application/pdf;base64,')) {
    return { error: 'Invalid PDF data URI format.' };
  }

  try {
    const { imageUrls, pdfText } = await extractImagesFromPdf({ pdfDataUri });

    // Don't wait for pals to return images
    const palsPromise = generatePixiPals({ pdfText });

    return { 
      images: imageUrls,
      palsPromise, 
      error: imageUrls.length === 0 ? "We couldn't find any images in the uploaded PDF." : undefined
    };

  } catch (e) {
    console.error('AI processing error:', e);
    return { error: 'The AI model failed to process the PDF. It might be corrupted or in an unsupported format.' };
  }
}
