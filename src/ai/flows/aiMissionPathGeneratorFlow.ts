'use server';
/**
 * @fileOverview A Genkit flow for generating safe and optimal UAV flight paths and corridors.
 *
 * - aiMissionPathGenerator - A function that handles the flight path generation process.
 * - AiMissionPathGeneratorInput - The input type for the aiMissionPathGenerator function.
 * - AiMissionPathGeneratorOutput - The return type for the aiMissionPathGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const WaypointSchema = z.object({
  latitude: z.number().describe('Latitude of the waypoint.'),
  longitude: z.number().describe('Longitude of the waypoint.'),
  altitude: z.number().optional().describe('Optional altitude of the waypoint. If not provided, the AI should determine an appropriate safe altitude.')
});

const RestrictedZoneSchema = z.object({
  id: z.string().describe('Unique identifier for the restricted zone.'),
  type: z.enum(['building', 'people_gathering', 'other_obstacle']).describe('Type of restricted zone.'),
  coordinates: z.array(z.object({
    latitude: z.number().describe('Latitude of a polygon vertex.'),
    longitude: z.number().describe('Longitude of a polygon vertex.')
  })).describe('Coordinates defining the boundary of the restricted zone as a polygon.'),
  description: z.string().optional().describe('Further description of the restricted zone.')
});

const AiMissionPathGeneratorInputSchema = z.object({
  waypoints: z.array(WaypointSchema).describe('An ordered list of waypoints the UAV must visit.'),
  restrictedZones: z.array(RestrictedZoneSchema).optional().describe('Detected environmental restrictions and no-fly zones.'),
  uavType: z.enum(['MT', 'ST', 'SVVP']).describe('Type of UAV (Multi-rotor, Fixed-wing, VTOL).'),
  payloads: z.array(z.string()).optional().describe('List of attached sensor payloads (e.g., "lidar-mid360", "course-camera").'),
  aerialMapDataUri: z
    .string()
    .describe(
      "An aerial map of the mission area, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  missionObjective: z.string().optional().describe('Optional description of the mission objective to help determine optimal path.')
});
export type AiMissionPathGeneratorInput = z.infer<typeof AiMissionPathGeneratorInputSchema>;

// Output Schema
const FlightPathPointSchema = z.object({
  latitude: z.number().describe('Latitude of a point on the flight path.'),
  longitude: z.number().describe('Longitude of a point on the flight path.'),
  altitude: z.number().describe('Altitude of a point on the flight path in meters.')
});

const SafeCorridorSegmentSchema = z.object({
  centerLatitude: z.number().describe('Latitude of the center of a safe corridor segment.'),
  centerLongitude: z.number().describe('Longitude of the center of a safe corridor segment.'),
  centerAltitude: z.number().describe('Altitude of the center of a safe corridor segment in meters.'),
  width: z.number().describe('Width of the safe corridor segment in meters.'),
  height: z.number().describe('Height of the safe corridor segment in meters.')
});

const AiMissionPathGeneratorOutputSchema = z.object({
  flightPath: z.array(FlightPathPointSchema).describe('The calculated optimal flight path.'),
  safeCorridor: z.array(SafeCorridorSegmentSchema).describe('The calculated safe corridor for emergency fallback.'),
  warnings: z.array(z.string()).optional().describe('Any warnings or considerations during path generation.'),
  notes: z.string().optional().describe('Additional notes or explanations about the generated path.')
});
export type AiMissionPathGeneratorOutput = z.infer<typeof AiMissionPathGeneratorOutputSchema>;

export async function aiMissionPathGenerator(input: AiMissionPathGeneratorInput): Promise<AiMissionPathGeneratorOutput> {
  return aiMissionPathGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMissionPathGeneratorPrompt',
  input: {schema: AiMissionPathGeneratorInputSchema},
  output: {schema: AiMissionPathGeneratorOutputSchema},
  prompt: `You are an expert UAV mission planner AI. Your task is to generate an optimal and safe flight path, and a corresponding 'safe corridor', for a UAV mission. You must ensure the path avoids all restricted zones and maintains safety for third parties and infrastructure, even in emergency situations.\n\nUAV Type: {{{uavType}}}\nPayloads: {{{payloads}}}\nMission Objective: {{{missionObjective}}}\n\nWaypoints to visit (in order):\n{{#each waypoints}}\n- Lat: {{{latitude}}}, Lng: {{{longitude}}} {{#if altitude}}, Alt: {{{altitude}}}m{{/if}}\n{{/each}}\n\nRestricted Zones:\n{{#if restrictedZones}}\n{{#each restrictedZones}}\n- ID: {{{id}}}, Type: {{{type}}}, Description: {{{description}}}\n  Coordinates (polygon): {{#each coordinates}} (Lat: {{{latitude}}}, Lng: {{{longitude}}}) {{/each}}\n{{/each}}\n{{else}}\nNo specific restricted zones provided, assume general safety guidelines apply.\n{{/if}}\n\nAerial Map: {{media url=aerialMapDataUri}}\n\nBased on the provided information, generate:\n1.  An optimal flight path that connects all waypoints in order, avoiding all restricted zones and obstacles, and considering the UAV type and payloads. The path should consist of a series of latitude, longitude, and altitude points.\n2.  A 'safe corridor' for the entire mission. This corridor represents a safe emergency landing or holding area path, ensuring the UAV can navigate safely even if primary systems fail. Define it as a series of segments, each with a center point (lat, lng, alt), width, and height. The safe corridor must be wide and tall enough to accommodate the UAV's size and potential drift, and it must also completely avoid restricted zones.\n3.  Any warnings or important notes regarding the generated path or potential issues.\n\nEnsure the generated path prioritizes safety, efficiency, and compliance. All altitudes should be in meters above ground level.`
});

const aiMissionPathGeneratorFlow = ai.defineFlow(
  {
    name: 'aiMissionPathGeneratorFlow',
    inputSchema: AiMissionPathGeneratorInputSchema,
    outputSchema: AiMissionPathGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);