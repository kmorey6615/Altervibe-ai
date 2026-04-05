
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

const generateSocialMediaCaptionFlow = ai.defineFlow(
  {
    name: 'generateSocialMediaCaptionFlow',
    inputSchema: GenerateSocialMediaCaptionInputSchema,
    outputSchema: GenerateSocialMediaCaptionOutputSchema,
  },
  async (input) => {
    // Mocking the AI response to ensure the app works without an API key
    const mockCaptions = {
      photo: `Editorial dump from the ${input.contentStyle} set. ✨ Channeling that ${input.characterStyle} energy today. What do we think of the fit?`,
      video: `POV: You're witnessing the ${input.contentStyle} of the century. 🎬 Just a quick snippet from my day. Stay tuned for more!`,
    };

    return {
      caption: mockCaptions[input.contentType],
      hashtags: ['#AlterVibe', `#${input.characterName.replace(/\s+/g, '')}`, '#AIInfluencer', '#VirtualStyle'],
    };
  }
);
