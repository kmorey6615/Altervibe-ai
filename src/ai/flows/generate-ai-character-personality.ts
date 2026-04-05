
'use server';
/**
 * @fileOverview A Genkit flow for generating two distinct AI character personality concepts.
 *
 * - generatePersonality - A function that handles the generation process.
 * - GeneratePersonalityInput - The input type for the function.
 * - GeneratePersonalityOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePersonalityInputSchema = z.object({
  name: z.string().describe("The name of the AI character."),
  gender: z.string().describe("The gender of the AI character."),
  ageRange: z.string().describe("The age range of the AI character."),
  outfitIdeas: z.string().describe("Specific outfit or clothing concepts."),
  aesthetic: z.string().describe("The visual aesthetic or style."),
  vibe: z.string().describe("The personality vibe or aura."),
});
export type GeneratePersonalityInput = z.infer<typeof GeneratePersonalityInputSchema>;

const PersonalityOptionSchema = z.object({
  id: z.string().describe("A unique identifier for this option."),
  personalityDescription: z.string().describe("A detailed description of the character's personality and back-story."),
  visualDescription: z.string().describe("A description of the character's signature look and lighting vibe."),
  catchphrase: z.string().describe("A short, catchy phrase the character often uses."),
});

const GeneratePersonalityOutputSchema = z.object({
  options: z.array(PersonalityOptionSchema).length(2).describe("Exactly two distinct personality options for the user to choose from."),
});
export type GeneratePersonalityOutput = z.infer<typeof GeneratePersonalityOutputSchema>;

const personalityPrompt = ai.definePrompt({
  name: 'personalityPrompt',
  input: { schema: GeneratePersonalityInputSchema },
  output: { schema: GeneratePersonalityOutputSchema },
  prompt: `You are a creative director for a top AI Influencer agency.
  
  User Inputs:
  Name: {{name}}
  Gender: {{gender}}
  Age Range: {{ageRange}}
  Outfit Concepts: {{outfitIdeas}}
  Aesthetic: {{aesthetic}}
  Vibe: {{vibe}}
  
  Generate exactly TWO distinct, high-concept personality and visual profiles for this character. 
  Each profile should feel unique even if they share the same base inputs.
  Make them sound trendy, engaging, and fit for short-form video platforms like TikTok.`,
});

export async function generatePersonality(input: GeneratePersonalityInput): Promise<GeneratePersonalityOutput> {
  return generatePersonalityFlow(input);
}

const generatePersonalityFlow = ai.defineFlow(
  {
    name: 'generatePersonalityFlow',
    inputSchema: GeneratePersonalityInputSchema,
    outputSchema: GeneratePersonalityOutputSchema,
  },
  async (input) => {
    const { output } = await personalityPrompt(input);
    if (!output) {
      throw new Error('Failed to generate personality options');
    }
    return output;
  }
);
