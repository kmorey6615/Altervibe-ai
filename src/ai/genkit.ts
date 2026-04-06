
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // Use the standard model identifier string for better compatibility
  model: 'googleai/gemini-1.5-flash',
});
