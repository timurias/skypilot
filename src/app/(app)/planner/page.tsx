'use client';

import * as React from 'react';
import Image from 'next/image';
import { Bot, MapPin, Trash2, X, AlertTriangle, Info } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

type Waypoint = { x: number; y: number };
type FlightPath = Waypoint[];
type SafeCorridor = Waypoint[];
type RestrictedZone = {
  id: string;
  points: string;
  color: string;
};

const mapImage = PlaceHolderImages.find((img) => img.id === 'aerial_map');

const mockRestrictedZones: RestrictedZone[] = [
    { id: 'zone1', points: "150,100 250,100 300,200 200,250 100,200", color: "hsl(var(--destructive) / 0.3)"},
    { id: 'zone2', points: "600,400 750,450 700,600 550,550", color: "hsl(var(--destructive) / 0.3)"},
    { id: 'zone3', points: "850,150 950,150 950,250 850,250", color: "hsl(var(--destructive) / 0.3)"},
];

export default function PlannerPage() {
  const [waypoints, setWaypoints] = React.useState<Waypoint[]>([]);
  const [flightPath, setFlightPath] = React.useState<FlightPath | null>(null);
  const [safeCorridor, setSafeCorridor = React.useState<SafeCorridor | null>(null);
  const [aiResponse, setAiResponse = React.useState<{warnings: string[], notes: string} | null>(null);
  const [isLoading, setIsLoading = React.useState(false);
  const mapRef = React.useRef<HTMLDivElement>(null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking inside a restricted zone
    // This is a simplified check; proper point-in-polygon test is needed for production
    const isInsideRestricted = mockRestrictedZones.some(zone => {
      // Very basic bounding box check
      const points = zone.points.split(' ').map(p => p.split(',').map(Number));
      const xs = points.map(p => p[0]);
      const ys = points.map(p => p[1]);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      return x > minX && x < maxX && y > minY && y < maxY;
    });

    if (!isInsideRestricted) {
      setWaypoints([...waypoints, { x, y }]);
    } else {
      // Could show a toast notification here
      console.warn("Cannot place waypoint in a restricted zone.");
    }
  };

  const removeWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const handleGeneratePath = () => {
    if (waypoints.length < 2) return;
    setIsLoading(true);
    // Mocking AI call
    setTimeout(() => {
        const path = [...waypoints]; // Simplified path
        setFlightPath(path);
        setSafeCorridor(path);
        setAiResponse({
            warnings: ["High wind advisory in sector Gamma-7.", "Potential GPS interference near tall structures."],
            notes: "Path optimized for energy efficiency while maintaining a 50m buffer from all restricted zones. Safe corridor calculated for emergency descent at a 3:1 glide ratio."
        });
        setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="AI Mission Planner"
        description="Design flight missions by placing waypoints on the map. The AI will generate an optimal and safe flight path."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mission Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={mapRef}
                onClick={handleMapClick}
                className="relative aspect-[3/2] w-full cursor-crosshair overflow-hidden rounded-lg border"
              >
                {mapImage && (
                  <Image
                    src={mapImage.imageUrl}
                    alt={mapImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={mapImage.imageHint}
                    priority
                  />
                )}
                <svg className="absolute inset-0 h-full w-full">
                  {/* Restricted Zones */}
                  {mockRestrictedZones.map(zone => (
                    <polygon key={zone.id} points={zone.points} fill={zone.color} stroke="hsl(var(--destructive))" strokeWidth="1" />
                  ))}
                  {/* Safe Corridor */}
                  {safeCorridor && (
                     <polyline
                        points={safeCorridor.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="hsl(var(--primary) / 0.3)"
                        strokeWidth="30"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     />
                  )}
                  {/* Flight Path */}
                   {flightPath && (
                     <polyline
                        points={flightPath.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="hsl(var(--accent-foreground))"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                     />
                  )}
                  {/* Waypoints */}
                  {waypoints.map((wp, i) => (
                    <g key={i} transform={`translate(${wp.x}, ${wp.y})`}>
                       <circle cx="0" cy="0" r="10" fill="hsl(var(--primary) / 0.5)" />
                       <circle cx="0" cy="0" r="4" fill="hsl(var(--primary-foreground))" stroke="hsl(var(--primary))" strokeWidth="2" />
                       <text
                          x="0"
                          y="4"
                          fill="hsl(var(--primary-foreground))"
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {i + 1}
                        </text>
                    </g>
                  ))}
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGeneratePath} disabled={isLoading || waypoints.length < 2} className="w-full">
                <Bot className="mr-2" />
                {isLoading ? 'Generating...' : 'Generate Safe Path'}
              </Button>
              <Button onClick={() => { setWaypoints([]); setFlightPath(null); setSafeCorridor(null); setAiResponse(null);}} variant="destructive" className="w-full">
                <X className="mr-2" />
                Clear Mission
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Waypoints</CardTitle>
            </CardHeader>
            <CardContent>
              {waypoints.length > 0 ? (
                <ul className="space-y-2">
                  {waypoints.map((wp, i) => (
                    <li key={i} className="flex items-center justify-between rounded-md bg-muted p-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span>Waypoint {i + 1}</span>
                      </div>
                       <Button variant="ghost" size="icon" onClick={() => removeWaypoint(i)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                       </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Click on the map to add waypoints.</p>
              )}
            </CardContent>
          </Card>

          {isLoading && (
            <Card>
                <CardHeader><CardTitle>AI Analysis</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
          )}

          {aiResponse && (
            <Card>
                <CardHeader><CardTitle>AI Analysis</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {aiResponse.warnings.length > 0 && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Warnings</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc pl-5">
                                    {aiResponse.warnings.map((w,i) => <li key={i}>{w}</li>)}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Notes</AlertTitle>
                        <AlertDescription>
                            {aiResponse.notes}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
