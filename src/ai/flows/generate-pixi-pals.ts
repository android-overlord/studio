'use server';
/**
 * @fileOverview Generates "Pixi Pals" based on the text content of a PDF.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define schemas for the AI flow inputs and outputs
const PalSchema = z.object({
  name: z.string().describe('The name of the Pixi Pal.'),
  backstory: z.string().describe('A short, whimsical backstory for the Pixi Pal.'),
  color: z.string().describe('A primary color for the Pixi Pal, as a hex code.'),
  image_prompt: z.string().describe('A DALL-E prompt to generate an image of the Pixi Pal.'),
});

const GeneratePixiPalsInputSchema = z.object({
  pdfText: z.string().describe('The text content extracted from a PDF.'),
});
export type GeneratePixiPalsInput = z.infer<typeof GeneratePixiPalsInputSchema>;

const GeneratePixiPalsOutputSchema = z.object({
  pals: z.array(PalSchema).describe('An array of generated Pixi Pals.'),
});
export type GeneratePixiPalsOutput = z.infer<typeof GeneratePixiPalsOutputSchema>;

export interface PixiPal extends z.infer<typeof PalSchema> {
  imageUrl?: string;
}

// Define the main prompt for generating Pixi Pals
const pixiPalsPrompt = ai.definePrompt({
  name: 'pixiPalsPrompt',
  input: { schema: GeneratePixiPalsInputSchema },
  output: { schema: GeneratePixiPalsOutputSchema },
  prompt: `You are a creative assistant that generates whimsical characters called "Pixi Pals" based on a given text.
    Analyze the following text and create 2-4 unique Pixi Pals. For each pal, provide a name, a short backstory, a primary color, and a DALL-E image prompt.
    The pals should be cute, magical creatures. The backstories should be lighthearted and imaginative.
    The image prompt should be in a sticker style, simple, and suitable for generating a cute character image.

    PDF Text:
    {{{pdfText}}}`,
});

// Define the flow for generating Pixi Pal characters (without images)
const generatePalsFlow = ai.defineFlow(
  {
    name: 'generatePalsFlow',
    inputSchema: GeneratePixiPalsInputSchema,
    outputSchema: GeneratePixiPalsOutputSchema,
  },
  async (input) => {
    const { output } = await pixiPalsPrompt(input);
    return output ?? { pals: [] };
  }
);

// Define the flow for generating a single Pixi Pal image
const generatePalImageFlow = ai.defineFlow(
  {
    name: 'generatePalImageFlow',
    inputSchema: z.string(), // The image prompt
    outputSchema: z.string(), // The image data URI
  },
  async (prompt) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `${prompt}, cute sticker illustration, vector, simple background`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return media?.url ?? '';
  }
);


// The main exported function that orchestrates the entire process
export async function generatePixiPals(input: GeneratePixiPalsInput): Promise<{ pals: PixiPal[] }> {
  // Step 1: Generate the character details (name, backstory, etc.)
  const palsData = await generatePalsFlow(input);

  // Step 2: Generate an image for each character in parallel
  const imagePromises = palsData.pals.map(pal => generatePalImageFlow(pal.image_prompt));
  const imageUrls = await Promise.all(imagePromises);

  // Step 3: Combine the character data with the generated image URLs
  const palsWithImages: PixiPal[] = palsData.pals.map((pal, index) => ({
    ...pal,
    imageUrl: imageUrls[index],
  }));

  return { pals: palsWithImages };
}
