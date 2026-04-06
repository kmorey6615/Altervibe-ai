'use server';
/**
 * @fileOverview A Genkit flow for generating marketing copy and visual concepts for products.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProductMarketingInputSchema = z.object({
  productName: z.string().describe("The name of the product."),
  category: z.string().describe("The product category (e.g., Skincare, Tech, Fashion)."),
  description: z.string().describe("A brief description of the product."),
  targetAudience: z.string().describe("The intended audience."),
  platform: z.enum(['Instagram', 'TikTok', 'Facebook', 'LinkedIn']).describe("The platform for the marketing content."),
});
export type GenerateProductMarketingInput = z.infer<typeof GenerateProductMarketingInputSchema>;

const GenerateProductMarketingOutputSchema = z.object({
  headline: z.string().describe("A catchy marketing headline."),
  adCopy: z.string().describe("Persuasive ad copy for the post."),
  hooks: z.array(z.string()).describe("Three different scroll-stopping hooks."),
  visualConcept: z.string().describe("A description of the ideal visual setup for the product photo/video."),
  hashtags: z.array(z.string()).describe("Relevant marketing hashtags."),
});
export type GenerateProductMarketingOutput = z.infer<typeof GenerateProductMarketingOutputSchema>;

const productMarketingPrompt = ai.definePrompt({
  name: 'productMarketingPrompt',
  input: { schema: GenerateProductMarketingInputSchema },
  output: { schema: GenerateProductMarketingOutputSchema },
  prompt: `You are a world-class performance marketer.
  
  Product: {{productName}} ({{category}})
  Description: {{description}}
  Audience: {{targetAudience}}
  Platform: {{platform}}
  
  Generate a high-converting marketing package for this product. 
  The copy should be persuasive, highlight benefits over features, and fit the style of {{platform}}.
  Include scroll-stopping hooks and a detailed visual concept for a photo or video shoot.`,
});

export async function generateProductMarketing(input: GenerateProductMarketingInput): Promise<GenerateProductMarketingOutput> {
  return generateProductMarketingFlow(input);
}

const generateProductMarketingFlow = ai.defineFlow(
  {
    name: 'generateProductMarketingFlow',
    inputSchema: GenerateProductMarketingInputSchema,
    outputSchema: GenerateProductMarketingOutputSchema,
  },
  async (input) => {
    // Temporarily mocking output for rapid testing
    return {
      headline: `Experience the Future of ${input.category}: ${input.productName}`,
      adCopy: `Tired of basic results? ${input.productName} is specifically designed for ${input.targetAudience} who demand excellence. Whether you're at home or on the go, our innovative approach to ${input.category} ensures you stay ahead of the curve.`,
      hooks: [
        "Why nobody is talking about this...",
        "Stop scrolling if you care about your results.",
        "The secret tool every expert is using right now."
      ],
      visualConcept: "A clean, minimalist studio shot with soft dramatic lighting. The product is centered on a textured stone pedestal with natural elements in the background.",
      hashtags: ["#Innovation", `#${input.category.replace(/\s+/g, '')}`, "#MustHave", "#GameChanger"]
    };
  }
);
