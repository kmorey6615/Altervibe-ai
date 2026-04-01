'use server';
/**
 * @fileOverview A Genkit flow to generate a detailed personality description for an AI character.
 *
 * - generateAICharacterPersonality - A function that handles the AI character personality generation process.
 * - GenerateAICharacterPersonalityInput - The input type for the generateAICharacterPersonality function.
 * - GenerateAICharacterPersonalityOutput - The return type for the generateAICharacterPersonality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAICharacterPersonalityInputSchema = z.object({
  name: z.string().describe('The name of the AI character.'),
  style: z
    .string()
    .describe(
      'The general style or aesthetic of the AI character (e.g., "futuristic pop star", "vintage fashionista", "rebellious gamer").'
    ),
});
export type GenerateAICharacterPersonalityInput = z.infer<
  typeof GenerateAICharacterPersonalityInputSchema
>;

const GenerateAICharacterPersonalityOutputSchema = z.object({
  personalityDescription:
    z.string().describe('A detailed personality description for the AI character, suitable for a social media influencer.'),
});
export type GenerateAICharacterPersonalityOutput = z.infer<
  typeof GenerateAICharacterPersonalityOutputSchema
>;

export async function generateAICharacterPersonality(
  input: GenerateAICharacterPersonalityInput
): Promise<GenerateAICharacterPersonalityOutput> {
  return generateAICharacterPersonalityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAICharacterPersonalityPrompt',
  input: {schema: GenerateAICharacterPersonalityInputSchema},
  output: {schema: GenerateAICharacterPersonalityOutputSchema},
  prompt: `You are an AI character personality generator for social media influencers. Your task is to create a detailed and engaging personality description for an AI character.

Consider the following details:
Character Name: {{{name}}}
Character Style: {{{style}}}

The personality should be vibrant, unique, and suitable for creating short-form video content on platforms like TikTok and Instagram. Describe their key traits, interests, typical content themes, and how they would interact with their audience.`,
});

const generateAICharacterPersonalityFlow = ai.defineFlow(
  {
    name: 'generateAICharacterPersonalityFlow',
    inputSchema: GenerateAICharacterPersonalityInputSchema,
    outputSchema: GenerateAICharacterPersonalityOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
