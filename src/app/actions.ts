
'use server';

import { extractImagesFromPdf } from '@/ai/flows/extract-images-from-pdf';

export async function getImagesFromPdf(pdfDataUri: string) {
  if (!pdfDataUri.startsWith('data:application/pdf;base64,')) {
    return { error: 'Invalid PDF data URI format.' };
  }

  try {
    const result = await extractImagesFromPdf({ pdfDataUri });
    return { images: result.imageUrls };
  } catch (e) {
    console.error('AI extraction error:', e);
    return { error: 'The AI model failed to extract images. The PDF might be corrupted or in an unsupported format.' };
  }
}
