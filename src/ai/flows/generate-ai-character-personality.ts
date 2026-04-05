
'use server';
/**
 * @fileOverview A Genkit flow to generate detailed personality options for an AI character.
 *
 * - generateAICharacterPersonality - A function that handles the AI character personality generation process.
 * - GenerateAICharacterPersonalityInput - The input type for the generateAICharacterPersonality function.
 * - GenerateAICharacterPersonalityOutput - The return type for the generateAICharacterPersonality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAICharacterPersonalityInputSchema = z.object({
  name: z.string().describe('The name of the AI character.'),
  gender: z.string().describe('The gender of the character (e.g., Male, Female, Non-binary).'),
  ageRange: z.string().describe('The age range (e.g., 18-22, Late 20s).'),
  outfitIdeas: z.string().describe('Style or outfit concepts.'),
  aesthetic: z.string().describe('General aesthetic (e.g., Cyberpunk, Cottagecore).'),
  vibe: z.string().describe('The personality vibe (e.g., Sassy, Intellectual, Energetic).'),
});
export type GenerateAICharacterPersonalityInput = z.infer<
  typeof GenerateAICharacterPersonalityInputSchema
>;

const CharacterOptionSchema = z.object({
  id: z.string(),
  personalityDescription: z.string().describe('A detailed personality bio.'),
  visualDescription: z.string().describe('A detailed visual description for the character.'),
  catchphrase: z.string().describe('A signature phrase the character uses.'),
});

const GenerateAICharacterPersonalityOutputSchema = z.object({
  options: z.array(CharacterOptionSchema).describe('An array of two distinct character personality options based on the inputs.'),
});
export type GenerateAICharacterPersonalityOutput = z.infer<
  typeof GenerateAICharacterPersonalityOutputSchema
>;

export async function generateAICharacterPersonality(
  input: GenerateAICharacterPersonalityInput
): Promise<GenerateAICharacterPersonalityOutput> {
  return generateAICharacterPersonalityFlow(input);
}

const generateAICharacterPersonalityFlow = ai.defineFlow(
  {
    name: 'generateAICharacterPersonalityFlow',
    inputSchema: GenerateAICharacterPersonalityInputSchema,
    outputSchema: GenerateAICharacterPersonalityOutputSchema,
  },
  async (input) => {
    // Mocking the AI response to ensure the app works without an API key
    const output = {
      options: [
        {
          id: 'option-1',
          personalityDescription: `Flirty, confident, and playful. ${input.name} is a natural trendsetter who knows exactly how to capture an audience's attention with a ${input.vibe} attitude and ${input.aesthetic} flair.`,
          visualDescription: `Focuses on high-energy poses in ${input.outfitIdeas}. Common settings include vibrant urban backgrounds and neon-lit studios.`,
          catchphrase: "Stay vibe-y, stay you! ✨",
        },
        {
          id: 'option-2',
          personalityDescription: `Intellectual, mysterious, and effortlessly cool. This version of ${input.name} prefers deep conversations and a curated, high-concept ${input.aesthetic} look that feels both futuristic and grounded.`,
          visualDescription: `Cinematic, low-light photography. Often seen in thoughtful poses wearing signature ${input.outfitIdeas} pieces.`,
          catchphrase: "Logic is the ultimate aesthetic.",
        },
      ],
    };

    return output;
  }
);
