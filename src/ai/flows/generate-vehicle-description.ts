'use server';
/**
 * @fileOverview An AI assistant flow for generating detailed vehicle descriptions.
 *
 * - generateVehicleDescription - A function that handles the vehicle description generation process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateVehicleDescriptionOutputSchema = z.object({
  description: z.string().describe('A comprehensive and engaging description for the vehicle listing.'),
});

/**
 * Generates a detailed vehicle description using AI.
 * This is a Server Action.
 */
export async function generateVehicleDescription(input: {
  brand: string;
  model: string;
  type: 'bike' | 'scooter';
  year: number;
  kmRun: number;
  condition: string;
  price: number;
}) {
  try {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      output: { schema: GenerateVehicleDescriptionOutputSchema },
      prompt: `You are an expert automotive salesperson specializing in second-hand two-wheelers in Kathmandu, Nepal. 
      Your task is to generate a compelling, professional, and detailed sales description for a ${input.brand} ${input.model} ${input.type}.

      Vehicle Specifications:
      - Brand: ${input.brand}
      - Model: ${input.model}
      - Type: ${input.type}
      - Year: ${input.year}
      - Kilometers Run: ${input.kmRun} km
      - Condition: ${input.condition}
      - Price: NPR ${input.price.toLocaleString()}

      Craft a detailed description that covers:
      1. An engaging opening highlighting the model's popularity or reliability.
      2. Key features and performance advantages (e.g., fuel efficiency, ease of handling).
      3. Elaborate on the ${input.condition} condition, mentioning it's been inspected.
      4. Mention that the low mileage (${input.kmRun} km) makes it a great value.
      5. A strong call to action inviting them to visit Hamro G&G Auto Enterprises at Nayabasti, Boudha for a test ride.

      The description should be professional, enticing, and at least 150 words long.`,
    });

    if (!output) {
      throw new Error('AI failed to generate a response.');
    }

    return output;
  } catch (error) {
    console.error('Genkit Error:', error);
    throw new Error('Failed to generate description. Please check your connection and try again.');
  }
}
