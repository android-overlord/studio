'use server';
/**
 * @fileOverview Extracts images from a PDF file using AI.
 *
 * - extractImagesFromPdf - A function that extracts images from a PDF.
 * - ExtractImagesFromPdfInput - The input type for the extractImagesFromPdf function.
 * - ExtractImagesFromPdfOutput - The return type for the extractImagesFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {generate} from 'genkit';
import {z} from 'genkit';

const ExtractImagesFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractImagesFromPdfInput = z.infer<typeof ExtractImagesFromPdfInputSchema>;

const ExtractImagesFromPdfOutputSchema = z.object({
  imageUrls: z.array(z.string()).describe('An array of image URLs extracted from the PDF.'),
});
export type ExtractImagesFromPdfOutput = z.infer<typeof ExtractImagesFromPdfOutputSchema>;

export async function extractImagesFromPdf(input: ExtractImagesFromPdfInput): Promise<ExtractImagesFromPdfOutput> {
  return extractImagesFromPdfFlow(input);
}

const extractImagesFromPdfFlow = ai.defineFlow(
  {
    name: 'extractImagesFromPdfFlow',
    inputSchema: ExtractImagesFromPdfInputSchema,
    outputSchema: ExtractImagesFromPdfOutputSchema,
  },
  async input => {
    const llmResponse = await generate({
      model: ai.model,
      prompt: [
        {
          text: `
          Your task is to extract all the images from the following PDF document.
          Return all the extracted images.
        `,
        },
        {media: {url: input.pdfDataUri}},
      ],
    });

    const imageUrls = llmResponse.output?.message.content.flatMap(part => {
      if (part.media) {
        return [`data:${part.media.contentType};base64,${part.media.url}`]
      }
      return []
    }) ?? []

    return { imageUrls };
  }
);
