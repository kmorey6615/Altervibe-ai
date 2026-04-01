'use server';
/**
 * @fileOverview A Genkit flow for generating engaging social media captions.
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
  contentStyle: z.string().describe("The chosen content style for the video (e.g., viral dance, aesthetic, POV, lip sync)."),
});
export type GenerateSocialMediaCaptionInput = z.infer<typeof GenerateSocialMediaCaptionInputSchema>;

const GenerateSocialMediaCaptionOutputSchema = z.object({
  caption: z.string().describe("An engaging social media caption for the video."),
  hashtags: z.array(z.string()).describe("A list of relevant hashtags for the post."),
});
export type GenerateSocialMediaCaptionOutput = z.infer<typeof GenerateSocialMediaCaptionOutputSchema>;

export async function generateSocialMediaCaption(input: GenerateSocialMediaCaptionInput): Promise<GenerateSocialMediaCaptionOutput> {
  return generateSocialMediaCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSocialMediaCaptionPrompt',
  input: { schema: GenerateSocialMediaCaptionInputSchema },
  output: { schema: GenerateSocialMediaCaptionOutputSchema },
  prompt: `You are an expert social media caption writer for AI-generated influencers. Your task is to create a contextual and engaging caption for a short-form video.

Here are the details about the AI character and the content style:

Character Name: {{{characterName}}}
Character Age: {{{characterAge}}}
Character Style: {{{characterStyle}}}
Character Personality: {{{characterPersonality}}}
Content Style: {{{contentStyle}}}

Craft a caption that is fitting for this character and content style, suitable for platforms like TikTok or Instagram. Include relevant and trending hashtags.

Make sure the output is a JSON object with 'caption' and 'hashtags' fields.`,
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
