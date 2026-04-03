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
  options: z.array(CharacterOptionSchema).length(2).describe('Two distinct character personality options based on the inputs.'),
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
  prompt: `You are an AI character architect. Your task is to create TWO distinct and compelling personality options for an AI influencer.

Character Context:
- Name: {{{name}}}
- Gender: {{{gender}}}
- Age Range: {{{ageRange}}}
- Aesthetic: {{{aesthetic}}}
- Outfit Style: {{{outfitIdeas}}}
- Vibe: {{{vibe}}}

Generate two unique interpretations of these details. Option 1 should be more grounded and relatable, while Option 2 should be more stylized or "high-concept". 

Each option must include:
1. id: A unique string ID (e.g., "option-1", "option-2").
2. personalityDescription: A detailed personality bio.
3. visualDescription: A detailed description of their specific visual style and common poses.
4. catchphrase: A signature phrase the character uses.

The descriptions should be vibrant and optimized for social media engagement.`,
});

const generateAICharacterPersonalityFlow = ai.defineFlow(
  {
    name: 'generateAICharacterPersonalityFlow',
    inputSchema: GenerateAICharacterPersonalityInputSchema,
    outputSchema: GenerateAICharacterPersonalityOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate personality options');
    }
    return output;
  }
);
