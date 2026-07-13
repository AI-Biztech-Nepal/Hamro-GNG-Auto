'use server';
/**
 * @fileOverview A Genkit flow for generating SEO-friendly blog post drafts related to second-hand bikes and scooters in Nepal.
 *
 * - generateBlogPostDraft - A function that generates a blog post draft based on a given topic.
 * - GenerateBlogPostDraftInput - The input type for the generateBlogPostDraft function.
 * - GenerateBlogPostDraftOutput - The return type for the generateBlogPostDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogPostDraftInputSchema = z.object({
  topic: z.string().describe('The topic for the blog post, related to second-hand bikes or scooters in Nepal.'),
});
export type GenerateBlogPostDraftInput = z.infer<typeof GenerateBlogPostDraftInputSchema>;

const GenerateBlogPostDraftOutputSchema = z.object({
  title: z.string().describe('The SEO-friendly title of the blog post.'),
  introduction: z.string().describe('The introductory paragraph of the blog post.'),
  bodyParagraphs: z.array(z.string()).describe('An array of main body paragraphs for the blog post, each representing a distinct section.'),
  conclusion: z.string().describe('The concluding paragraph of the blog post.'),
  seoKeywords: z.array(z.string()).describe('A list of SEO-friendly keywords relevant to the blog post.'),
});
export type GenerateBlogPostDraftOutput = z.infer<typeof GenerateBlogPostDraftOutputSchema>;

export async function generateBlogPostDraft(
  input: GenerateBlogPostDraftInput
): Promise<GenerateBlogPostDraftOutput> {
  return generateBlogPostDraftFlow(input);
}

const blogPostPrompt = ai.definePrompt({
  name: 'generateBlogPostDraftPrompt',
  input: {schema: GenerateBlogPostDraftInputSchema},
  output: {schema: GenerateBlogPostDraftOutputSchema},
  prompt: `You are an expert content writer specializing in SEO-friendly blog posts for a second-hand bike and scooter dealership in Kathmandu, Nepal. Your goal is to write a compelling, informative, and engaging blog post draft based on the provided topic.

The blog post should be structured with a clear, catchy title, an engaging introduction, several distinct body paragraphs covering different aspects of the topic, and a strong, concise conclusion. Make sure the content is relevant to the Nepalese market and highlights the benefits of buying from a trusted dealership like Hamro G & G Auto Enterprises (even if not explicitly mentioned by name, keep the context in mind).

Additionally, provide a list of relevant SEO keywords that would help the blog post rank higher in search results.

Topic: {{{topic}}}`,
});

const generateBlogPostDraftFlow = ai.defineFlow(
  {
    name: 'generateBlogPostDraftFlow',
    inputSchema: GenerateBlogPostDraftInputSchema,
    outputSchema: GenerateBlogPostDraftOutputSchema,
  },
  async input => {
    const {output} = await blogPostPrompt(input);
    if (!output) {
      throw new Error('Failed to generate blog post draft.');
    }
    return output;
  }
);
