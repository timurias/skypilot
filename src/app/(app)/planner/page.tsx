'use client';

import * as React from 'react';
import { Bot, MapPin, Trash2, X, AlertTriangle, Info, ShieldAlert, RefreshCcw } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import type { Waypoint, RestrictedZone } from '@/lib/types';

const MAP_SRC = '/map.png';
const FALLBACK_MAP = 'https://sovzond.ru/upload/medialibrary/9c8/1.jpg';

export default function PlannerPage() {
  const { toast } = useToast();
  const { mission, setMission, resetAll } = useAppContext();
  
  const [currentZonePoints, setCurrentZonePoints] = React.useState<Waypoint[]>([]);
  const [plannerMode, setPlannerMode] = React.useState<'waypoints' | 'zones'>('waypoints');
  const [isLoading, setIsLoading] = React.useState(false);
  const [mapError, setMapError] = React.useState(false);
  const mapRef = React.useRef<HTMLDivElement>(null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (plannerMode === 'waypoints') {
      setMission(prev => ({
        ...prev,
        waypoints: [...prev.waypoints, { x, y }]
      }));
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
    setMission(prev => ({
        ...prev,
        restrictedZones: [...prev.restrictedZones, newZone]
    }));
    setCurrentZonePoints([]);
    toast({
      title: "Зона создана",
      description: "Запретная зона добавлена в миссию.",
    });
  };

  const removeWaypoint = (index: number) => {
    setMission(prev => ({
        ...prev,
        waypoints: prev.waypoints.filter((_, i) => i !== index)
    }));
  };

  const removeZone = (id: string) => {
    setMission(prev => ({
        ...prev,
        restrictedZones: prev.restrictedZones.filter(z => z.id !== id)
    }));
  };

  const handleGeneratePath = () => {
    if (mission.waypoints.length < 2) return;
    setIsLoading(true);
    
    setTimeout(() => {
        const path = [...mission.waypoints];
        setMission(prev => ({
            ...prev,
            flightPath: path,
            safeCorridor: path
        }));
        setIsLoading(false);
        toast({
            title: "Маршрут построен",
            description: "ИИ успешно проложил оптимальный путь.",
        });
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="ИИ Планировщик миссий"
          description="Проектируйте маршруты и запретные зоны. Данные сохраняются автоматически."
        />
         <Button variant="outline" size="sm" onClick={resetAll} className="gap-2">
           <RefreshCcw className="h-4 w-4" /> Обновить всё
        </Button>
      </div>

      {mapError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Проблема загрузки карты</AlertTitle>
          <AlertDescription>
            Файл <code className="bg-muted px-1 rounded mx-1">map.png</code> не найден в <code className="bg-muted px-1 rounded mx-1">public/</code>.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-2">
              <div>
                <CardTitle>Интерактивная карта</CardTitle>
                <CardDescription>Используйте инструменты для разметки.</CardDescription>
              </div>
              <Tabs value={plannerMode} onValueChange={(v) => v && setPlannerMode(v as any)}>
                <TabsList className="grid w-[240px] grid-cols-2">
                  <TabsTrigger value="waypoints">Точки</TabsTrigger>
                  <TabsTrigger value="zones">Зоны</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div
                ref={mapRef}
                onClick={handleMapClick}
                className="relative aspect-[16/9] w-full cursor-crosshair overflow-hidden rounded-lg border bg-muted shadow-inner"
              >
                <img
                  src={MAP_SRC}
                  alt="Mission Map"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    setMapError(true);
                    (e.target as HTMLImageElement).src = FALLBACK_MAP;
                  }}
                />
                
                <svg className="absolute inset-0 h-full w-full pointer-events-none">
                  {/* Restricted Zones */}
                  {mission.restrictedZones.map(zone => (
                    <polygon 
                      key={zone.id} 
                      points={zone.points.map(p => `${p.x},${p.y}`).join(' ')} 
                      fill={zone.color} 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth="2" 
                    />
                  ))}

                  {/* Drawing Zone */}
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

                  {/* Path & Corridor */}
                  {mission.safeCorridor && (
                     <polyline
                        points={mission.safeCorridor.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="hsl(var(--primary) / 0.1)"
                        strokeWidth="30"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     />
                  )}
                   {mission.flightPath && (
                     <polyline
                        points={mission.flightPath.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        strokeDasharray="6,6"
                     />
                  )}

                  {/* Waypoints */}
                  {mission.waypoints.map((wp, i) => (
                    <g key={i} transform={`translate(${wp.x}, ${wp.y})`}>
                       <circle cx="0" cy="0" r="10" fill="hsl(var(--primary) / 0.3)" />
                       <circle cx="0" cy="0" r="4" fill="hsl(var(--primary-foreground))" stroke="hsl(var(--primary))" strokeWidth="2" />
                       <text x="0" y="-12" fill="white" textAnchor="middle" fontSize="10" fontWeight="bold">Т{i + 1}</text>
                    </g>
                  ))}
                </svg>
              </div>
              
              {plannerMode === 'zones' && currentZonePoints.length > 0 && (
                <div className="mt-4 flex gap-2">
                   <Button size="sm" onClick={finishZone} disabled={currentZonePoints.length < 3}>Завершить зону</Button>
                   <Button size="sm" variant="outline" onClick={() => setCurrentZonePoints([])}>Отмена</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Действия</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGeneratePath} disabled={isLoading || mission.waypoints.length < 2} className="w-full h-12">
                <Bot className="mr-2 h-5 w-5" /> {isLoading ? 'Расчет...' : 'ИИ Маршрут'}
              </Button>
              <Button 
                onClick={() => setMission({ waypoints: [], restrictedZones: [], flightPath: null, safeCorridor: null })} 
                variant="destructive" 
                className="w-full"
                disabled={mission.waypoints.length === 0 && mission.restrictedZones.length === 0}
              >
                <X className="mr-2 h-4 w-4" /> Очистить карту
              </Button>
            </CardContent>
          </Card>

          <Card className="max-h-[400px] overflow-hidden flex flex-col">
            <CardHeader><CardTitle className="text-sm">Объекты миссии</CardTitle></CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Точки ({mission.waypoints.length})</h4>
                <div className="space-y-1">
                    {mission.waypoints.map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50 border text-xs">
                            <span>Контрольная точка {i + 1}</span>
                            <Button variant="ghost" size="icon" onClick={() => removeWaypoint(i)} className="h-6 w-6"><Trash2 className="h-3 w-3"/></Button>
                        </div>
                    ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Зоны ({mission.restrictedZones.length})</h4>
                <div className="space-y-1">
                    {mission.restrictedZones.map((z, i) => (
                        <div key={z.id} className="flex items-center justify-between p-2 rounded bg-destructive/5 border border-destructive/20 text-xs">
                            <span>Запретная зона {i + 1}</span>
                            <Button variant="ghost" size="icon" onClick={() => removeZone(z.id)} className="h-6 w-6"><Trash2 className="h-3 w-3"/></Button>
                        </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
