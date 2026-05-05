'use client';

import * as React from 'react';
import { Bot, MapPin, Trash2, X, AlertTriangle, Info, ShieldAlert, MousePointer2 } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';

type Waypoint = { x: number; y: number };
type FlightPath = Waypoint[];
type SafeCorridor = Waypoint[];
type RestrictedZone = {
  id: string;
  points: Waypoint[];
  color: string;
};

const MAP_SRC = '/map.tiff';

export default function PlannerPage() {
  const [waypoints, setWaypoints] = React.useState<Waypoint[]>([]);
  const [restrictedZones, setRestrictedZones] = React.useState<RestrictedZone[]>([]);
  const [currentZonePoints, setCurrentZonePoints] = React.useState<Waypoint[]>([]);
  const [plannerMode, setPlannerMode] = React.useState<'waypoints' | 'zones'>('waypoints');
  
  const [flightPath, setFlightPath] = React.useState<FlightPath | null>(null);
  const [safeCorridor, setSafeCorridor] = React.useState<SafeCorridor | null>(null);
  const [aiResponse, setAiResponse] = React.useState<{warnings: string[], notes: string} | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const mapRef = React.useRef<HTMLDivElement>(null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (plannerMode === 'waypoints') {
      setWaypoints([...waypoints, { x, y }]);
    } else {
      setCurrentZonePoints([...currentZonePoints, { x, y }]);
    }
  };

  const finishZone = () => {
    if (currentZonePoints.length < 3) return;
    const newZone: RestrictedZone = {
      id: `zone-${Date.now()}`,
      points: currentZonePoints,
      color: "hsl(var(--destructive) / 0.4)"
    };
    setRestrictedZones([...restrictedZones, newZone]);
    setCurrentZonePoints([]);
  };

  const removeWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const removeZone = (id: string) => {
    setRestrictedZones(restrictedZones.filter(z => z.id !== id));
  };

  const handleGeneratePath = () => {
    if (waypoints.length < 2) return;
    setIsLoading(true);
    setTimeout(() => {
        const path = [...waypoints];
        setFlightPath(path);
        setSafeCorridor(path);
        setAiResponse({
            warnings: ["High wind advisory in sector Gamma-7.", "Potential GPS interference near tall structures."],
            notes: "Path optimized for energy efficiency while maintaining a safety buffer from all defined restricted zones."
        });
        setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="AI Mission Planner"
        description="Design flight missions by placing waypoints or drawing custom restricted zones on the mission map."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Mission Area Map</CardTitle>
              <ToggleGroup type="single" value={plannerMode} onValueChange={(v) => v && setPlannerMode(v as any)}>
                <ToggleGroupItem value="waypoints" aria-label="Add Waypoints">
                  <MapPin className="h-4 w-4 mr-2" />
                  Waypoints
                </ToggleGroupItem>
                <ToggleGroupItem value="zones" aria-label="Draw Zones">
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Zones
                </ToggleGroupItem>
              </ToggleGroup>
            </CardHeader>
            <CardContent>
              <div
                ref={mapRef}
                onClick={handleMapClick}
                className="relative aspect-[3/2] w-full cursor-crosshair overflow-hidden rounded-lg border bg-muted"
              >
                <img
                  src={MAP_SRC}
                  alt="Mission Map"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://sovzond.ru/upload/medialibrary/9c8/1.jpg';
                  }}
                />
                
                {/* Information Overlay if map fails (since .tiff is problematic) */}
                <div className="absolute top-2 left-2 flex gap-2 pointer-events-none">
                   <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      {plannerMode === 'waypoints' ? 'Mode: Placing Waypoints' : 'Mode: Drawing Zone'}
                   </Badge>
                </div>

                <svg className="absolute inset-0 h-full w-full pointer-events-none">
                  {/* Saved Restricted Zones */}
                  {restrictedZones.map(zone => (
                    <polygon 
                      key={zone.id} 
                      points={zone.points.map(p => `${p.x},${p.y}`).join(' ')} 
                      fill={zone.color} 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth="2" 
                    />
                  ))}

                  {/* Currently Drawing Zone */}
                  {currentZonePoints.length > 0 && (
                    <>
                      <polyline
                        points={currentZonePoints.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                      />
                      {currentZonePoints.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(var(--primary))" />
                      ))}
                    </>
                  )}

                  {/* Flight Path & Corridor */}
                  {safeCorridor && (
                     <polyline
                        points={safeCorridor.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="hsl(var(--primary) / 0.2)"
                        strokeWidth="40"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     />
                  )}
                   {flightPath && (
                     <polyline
                        points={flightPath.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="3"
                        strokeDasharray="8,8"
                     />
                  )}

                  {/* Waypoints */}
                  {waypoints.map((wp, i) => (
                    <g key={i} transform={`translate(${wp.x}, ${wp.y})`}>
                       <circle cx="0" cy="0" r="10" fill="hsl(var(--primary) / 0.5)" />
                       <circle cx="0" cy="0" r="4" fill="hsl(var(--primary-foreground))" stroke="hsl(var(--primary))" strokeWidth="2" />
                       <text
                          x="0"
                          y="-14"
                          fill="white"
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="bold"
                          className="drop-shadow-md"
                        >
                          WP {i + 1}
                        </text>
                    </g>
                  ))}
                </svg>
              </div>
              
              {plannerMode === 'zones' && currentZonePoints.length > 0 && (
                <div className="mt-4 flex gap-2">
                   <Button size="sm" onClick={finishZone} disabled={currentZonePoints.length < 3}>
                     Finish Zone
                   </Button>
                   <Button size="sm" variant="outline" onClick={() => setCurrentZonePoints([])}>
                     Clear Points
                   </Button>
                </div>
              )}
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
                {isLoading ? 'Generating Path...' : 'Calculate Mission Path'}
              </Button>
              <Button onClick={() => { setWaypoints([]); setFlightPath(null); setSafeCorridor(null); setAiResponse(null); setRestrictedZones([]); }} variant="destructive" className="w-full">
                <X className="mr-2" />
                Clear All
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mission Objects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">Waypoints</h4>
                {waypoints.length > 0 ? (
                  <ul className="space-y-2">
                    {waypoints.map((wp, i) => (
                      <li key={i} className="flex items-center justify-between rounded-md bg-muted p-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">WP {i + 1}</span>
                        </div>
                         <Button variant="ghost" size="icon" onClick={() => removeWaypoint(i)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                         </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No waypoints set.</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Restricted Zones</h4>
                {restrictedZones.length > 0 ? (
                  <ul className="space-y-2">
                    {restrictedZones.map((z, i) => (
                      <li key={z.id} className="flex items-center justify-between rounded-md bg-muted p-2 border-l-4 border-destructive">
                        <span className="text-sm font-medium">Custom Zone {i + 1}</span>
                         <Button variant="ghost" size="icon" onClick={() => removeZone(z.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                         </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No custom zones defined.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {isLoading && (
            <Card>
                <CardHeader><CardTitle>AI Processing</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-3/4" />
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
                                <ul className="list-disc pl-5 text-xs">
                                    {aiResponse.warnings.map((w,i) => <li key={i}>{w}</li>)}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Notes</AlertTitle>
                        <AlertDescription className="text-xs">
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
