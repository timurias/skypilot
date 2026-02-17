'use server';
/**
 * @fileOverview A Genkit flow for analyzing UAV performance data and suggesting optimal retraining parameters for neural networks.
 *
 * - aiSuggestedRetrainingParams - A function that suggests retraining parameters and data augmentation strategies.
 * - AISuggestedRetrainingParamsInput - The input type for the aiSuggestedRetrainingParams function.
 * - AISuggestedRetrainingParamsOutput - The return type for the aiSuggestedRetrainingParams function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISuggestedRetrainingParamsInputSchema = z.object({
  uavType: z
    .string()
    .describe(
      'The type of UAV (e.g., Multi-rotor, Fixed-wing, VTOL) for which the neural network is being retrained.'
    ),
  missionDescription: z
    .string()
    .describe('A brief description of the mission or simulation scenario.'),
  performanceSummary: z
    .string()
    .describe(
      "A summary of the UAV's performance during the test flight or simulation, including observed issues or areas for improvement."
    ),
  keyPerformanceMetrics: z
    .record(z.any())
    .describe(
      'Key performance metrics and their values from the test, e.g., {"stabilityScore": 0.7, "pathDeviation_m": 2.5}.'
    ),
  currentTrainingParameters: z
    .string()
    .describe(
      'A description of the current neural network training parameters and methods used (e.g., "Learning rate 0.001, 50 epochs, Adam optimizer, no data augmentation").'
    ),
});
export type AISuggestedRetrainingParamsInput = z.infer<
  typeof AISuggestedRetrainingParamsInputSchema
>;

const AISuggestedRetrainingParamsOutputSchema = z.object({
  retrainingSuggestions: z
    .array(z.string())
    .describe(
      'A list of suggested retraining parameters (e.g., learning rate, batch size, optimizer) or strategies.'
    ),
  dataAugmentationStrategies: z
    .array(z.string())
    .describe(
      'A list of suggested data augmentation techniques or new data collection strategies.'
    ),
  focusedRetrainingScenarios: z
    .array(z.string())
    .describe(
      'Specific scenarios or conditions where the model should be retrained or validated more thoroughly.'
    ),
  rationale: z
    .string()
    .describe(
      'An explanation of why these suggestions are made based on the provided performance data.'
    ),
});
export type AISuggestedRetrainingParamsOutput = z.infer<
  typeof AISuggestedRetrainingParamsOutputSchema
>;

export async function aiSuggestedRetrainingParams(
  input: AISuggestedRetrainingParamsInput
): Promise<AISuggestedRetrainingParamsOutput> {
  return aiSuggestedRetrainingParamsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRetrainingParamsPrompt',
  input: {schema: AISuggestedRetrainingParamsInputSchema},
  output: {schema: AISuggestedRetrainingParamsOutputSchema},
  prompt: `You are an expert AI engineer specializing in neural network control algorithms for Unmanned Aerial Vehicles (UAVs). Your task is to analyze UAV performance data from a test flight or simulation and provide actionable suggestions for retraining parameters or data augmentation strategies to improve the neural network's control algorithms.

UAV Type: {{{uavType}}}
Mission Description: {{{missionDescription}}}
Performance Summary: {{{performanceSummary}}}
Key Performance Metrics: {{{JSON.stringify keyPerformanceMetrics}}}
Current Training Parameters: {{{currentTrainingParameters}}}

Based on this information, suggest optimal retraining parameters and data augmentation strategies. Focus on efficiency and effectiveness in improving the UAV's control. Provide a clear rationale for your suggestions.`,
});

const aiSuggestedRetrainingParamsFlow = ai.defineFlow(
  {
    name: 'aiSuggestedRetrainingParamsFlow',
    inputSchema: AISuggestedRetrainingParamsInputSchema,
    outputSchema: AISuggestedRetrainingParamsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
