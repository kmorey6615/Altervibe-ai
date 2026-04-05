
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

const personalityPrompt = ai.definePrompt({
  name: 'personalityPrompt',
  input: { schema: GenerateAICharacterPersonalityInputSchema },
  output: { schema: GenerateAICharacterPersonalityOutputSchema },
  prompt: `You are a creative character designer for an AI influencer platform called AlterVibe. 
  Your goal is to create two distinct, high-engagement personality options for a new AI character.
  
  Character Name: {{name}}
  Gender: {{gender}}
  Age Range: {{ageRange}}
  Outfit Ideas: {{outfitIdeas}}
  Aesthetic: {{aesthetic}}
  Vibe: {{vibe}}
  
  Generate two unique concepts that feel like modern social media influencers. 
  For each option:
  1. Create a deep, interesting personality description.
  2. Provide a visual description that a photographer or image generator could use.
  3. Give them a catchy signature phrase.
  Ensure the IDs are 'option-1' and 'option-2'.`,
});

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
    const { output } = await personalityPrompt(input);
    if (!output) {
      throw new Error('Failed to generate personality options');
    }
    return output;
  }
);
