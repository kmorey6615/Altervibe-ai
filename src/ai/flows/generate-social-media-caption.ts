'use server';
/**
 * @fileOverview A Genkit flow for generating engaging social media captions for photo or video content.
 *
 * - generateSocialMediaCaption - A function that handles the caption generation process.
 * - GenerateSocialMediaCaptionInput - The input type for the generateSocialMediaCaption function.
 * - GenerateSocialMediaCaptionOutput - The return type for the generateSocialMediaCaption function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSocialMediaCaptionInputSchema = z.object({
  characterName: z.string().describe("The name of the AI character."),
  characterAge: z.number().int().min(18).describe("The age of the AI character (18 or older)."),
  characterStyle: z.string().describe("The visual style or aesthetic of the AI character."),
  characterPersonality: z.string().describe("The personality traits of the AI character."),
  contentType: z.enum(['photo', 'video']).describe("Whether the content is a photo or a video."),
  contentStyle: z.string().describe("The chosen content style, trend, or specific prompt from the user."),
});
export type GenerateSocialMediaCaptionInput = z.infer<typeof GenerateSocialMediaCaptionInputSchema>;

const GenerateSocialMediaCaptionOutputSchema = z.object({
  caption: z.string().describe("An engaging social media caption for the post."),
  hashtags: z.array(z.string()).describe("A list of relevant hashtags."),
});
export type GenerateSocialMediaCaptionOutput = z.infer<typeof GenerateSocialMediaCaptionOutputSchema>;

export async function generateSocialMediaCaption(input: GenerateSocialMediaCaptionInput): Promise<GenerateSocialMediaCaptionOutput> {
  return generateSocialMediaCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSocialMediaCaptionPrompt',
  input: { schema: GenerateSocialMediaCaptionInputSchema },
  output: { schema: GenerateSocialMediaCaptionOutputSchema },
  prompt: `You are an expert social media manager for AI influencers. Your task is to create a contextual caption for a {{{contentType}}} post.

Details:
Character: {{{characterName}}} (Age: {{{characterAge}}})
Style: {{{characterStyle}}}
Personality: {{{characterPersonality}}}
Content Type: {{{contentType}}}
Vibe/Action: {{{contentStyle}}}

Task:
- If it's a "photo" set, the caption should sound like an editorial or a collection of snapshots. Mention the "aesthetic" or "fit".
- If it's a "video", make it sound like a dynamic moment, a vlog snippet, or a dance challenge.
- Use the character's unique voice and tone.
- Include 3-5 trending and relevant hashtags.`,
});

const generateSocialMediaCaptionFlow = ai.defineFlow(
  {
    name: 'generateSocialMediaCaptionFlow',
    inputSchema: GenerateSocialMediaCaptionInputSchema,
    outputSchema: GenerateSocialMediaCaptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
