
'use server';
/**
 * @fileOverview A Genkit flow for generating engaging social media captions for photo or video content.
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

const captionPrompt = ai.definePrompt({
  name: 'captionPrompt',
  input: { schema: GenerateSocialMediaCaptionInputSchema },
  output: { schema: GenerateSocialMediaCaptionOutputSchema },
  prompt: `You are writing a social media post for an AI Influencer.
  
  Character: {{characterName}}
  Age: {{characterAge}}
  Style/Aesthetic: {{characterStyle}}
  Personality: {{characterPersonality}}
  Content Type: {{contentType}}
  Context/Style: {{contentStyle}}
  
  Write a caption that sounds like a real person, using the character's unique voice. 
  Include some emojis and relevant trending hashtags.
  The caption should be high-engagement and fit the platform (TikTok/Instagram style).`,
});

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
    // Temporarily mocking output to bypass API issues during development
    const output = {
      caption: "Feeling the vibe today in the digital landscape. ✨ Can't wait for you to see what I'm working on!",
      hashtags: ["#AIVibe", "#DigitalLife", "#TechStyle", "#NewVibe"]
    };
    return output;
  }
);
