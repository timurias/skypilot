'use client';

import * as React from 'react';
import { Bot, MapPin, Trash2, X, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type Waypoint = { x: number; y: number };
type FlightPath = Waypoint[];
type SafeCorridor = Waypoint[];
type RestrictedZone = {
  id: string;
  points: Waypoint[];
  color: string;
};

// Assets as defined in README
const MAP_SRC = '/map.png';
const FALLBACK_MAP = 'https://sovzond.ru/upload/medialibrary/9c8/1.jpg';

export default function PlannerPage() {
  const { toast } = useToast();
  const [waypoints, setWaypoints] = React.useState<Waypoint[]>([]);
  const [restrictedZones, setRestrictedZones] = React.useState<RestrictedZone[]>([]);
  const [currentZonePoints, setCurrentZonePoints] = React.useState<Waypoint[]>([]);
  const [plannerMode, setPlannerMode] = React.useState<'waypoints' | 'zones'>('waypoints');
  
  const [flightPath, setFlightPath] = React.useState<FlightPath | null>(null);
  const [safeCorridor, setSafeCorridor] = React.useState<SafeCorridor | null>(null);
  const [aiResponse, setAiResponse] = React.useState<{warnings: string[], notes: string} | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [mapError, setMapError] = React.useState(false);
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
    toast({
      title: "Зона создана",
      description: "Пользовательская запретная зона добавлена в миссию.",
    });
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
    setFlightPath(null);
    setSafeCorridor(null);
    
    // Simulating AI path generation
    setTimeout(() => {
        const path = [...waypoints];
        setFlightPath(path);
        setSafeCorridor(path);
        setAiResponse({
            warnings: ["Предупреждение о сильном ветре в секторе Gamma-7.", "Возможные помехи GPS рядом с высокими конструкциями."],
            notes: "Маршрут оптимизирован для энергоэффективности с соблюдением безопасной дистанции от всех заданных запретных зон."
        });
        setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="ИИ Планировщик миссий"
        description="Проектируйте полетные задания, расставляя контрольные точки или рисуя запретные зоны на карте."
      />

      {mapError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Проблема загрузки карты</AlertTitle>
          <AlertDescription>
            Файл карты <code className="bg-muted px-1 rounded mx-1">map.png</code> не найден. 
            Пожалуйста, убедитесь, что вы разместили файл карты в папке <code className="bg-muted px-1 rounded mx-1">public/map.png</code>.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-2">
              <div>
                <CardTitle>Карта зоны миссии</CardTitle>
                <CardDescription>Нажимайте на карту для взаимодействия.</CardDescription>
              </div>
              <Tabs value={plannerMode} onValueChange={(v) => v && setPlannerMode(v as any)}>
                <TabsList className="grid w-[280px] grid-cols-2">
                  <TabsTrigger value="waypoints">
                    <MapPin className="h-4 w-4 mr-2" />
                    Точки
                  </TabsTrigger>
                  <TabsTrigger value="zones">
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    Зоны
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div
                ref={mapRef}
                onClick={handleMapClick}
                className="relative aspect-[3/2] w-full cursor-crosshair overflow-hidden rounded-lg border bg-muted shadow-inner"
              >
                <img
                  src={MAP_SRC}
                  alt="Карта миссии"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    setMapError(true);
                    (e.target as HTMLImageElement).src = FALLBACK_MAP;
                  }}
                />
                
                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                   <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border shadow-sm">
                      {plannerMode === 'waypoints' ? 'Режим: Расстановка точек' : 'Режим: Рисование зон'}
                   </Badge>
                   {plannerMode === 'zones' && currentZonePoints.length > 0 && (
                      <Badge variant="outline" className="bg-primary/10 backdrop-blur-sm border-primary/50 text-primary">
                        Рисование... ({currentZonePoints.length} точек)
                      </Badge>
                   )}
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
                        stroke="hsl(var(--primary) / 0.15)"
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
                       <circle cx="0" cy="0" r="12" fill="hsl(var(--primary) / 0.4)" />
                       <circle cx="0" cy="0" r="5" fill="hsl(var(--primary-foreground))" stroke="hsl(var(--primary))" strokeWidth="2" />
                       <text
                          x="0"
                          y="-16"
                          fill="white"
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="600"
                          className="drop-shadow-md select-none"
                        >
                          Т{i + 1}
                        </text>
                    </g>
                  ))}
                </svg>
              </div>
              
              {plannerMode === 'zones' && currentZonePoints.length > 0 && (
                <div className="mt-4 flex gap-2">
                   <Button size="sm" onClick={finishZone} disabled={currentZonePoints.length < 3}>
                     Сохранить запретную зону
                   </Button>
                   <Button size="sm" variant="outline" onClick={() => setCurrentZonePoints([])}>
                     Отмена
                   </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Управление миссией</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGeneratePath} 
                disabled={isLoading || waypoints.length < 2} 
                className="w-full h-12 text-lg font-semibold"
              >
                <Bot className="mr-2 h-5 w-5" />
                {isLoading ? 'Обработка...' : 'Сгенерировать ИИ маршрут'}
              </Button>
              <Button 
                onClick={() => { setWaypoints([]); setFlightPath(null); setSafeCorridor(null); setAiResponse(null); setRestrictedZones([]); }} 
                variant="destructive" 
                className="w-full"
                disabled={isLoading || (waypoints.length === 0 && restrictedZones.length === 0)}
              >
                <X className="mr-2" />
                Очистить миссию
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Инвентарь миссии</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                    <MapPin className="h-4 w-4" />
                    Контрольные точки
                </h4>
                {waypoints.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {waypoints.map((wp, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md bg-muted/50 p-3 border">
                        <span className="text-sm font-medium">Точка {i + 1}</span>
                         <Button variant="ghost" size="icon" onClick={() => removeWaypoint(i)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic bg-muted/30 p-4 rounded-md border border-dashed">Точки еще не установлены.</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-destructive">
                    <ShieldAlert className="h-4 w-4" />
                    Запретные зоны
                </h4>
                {restrictedZones.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {restrictedZones.map((z, i) => (
                      <div key={z.id} className="flex items-center justify-between rounded-md bg-destructive/5 p-3 border border-destructive/20">
                        <span className="text-sm font-medium">Бесполетная зона {i + 1}</span>
                         <Button variant="ghost" size="icon" onClick={() => removeZone(z.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic bg-muted/30 p-4 rounded-md border border-dashed">Запретные зоны не определены.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {isLoading && (
            <Card className="animate-pulse border-primary/50">
                <CardHeader><CardTitle className="text-primary flex items-center gap-2"><Bot className="h-5 w-5"/>ИИ прокладывает путь</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
          )}

          {aiResponse && !isLoading && (
            <Card className="border-primary/20 bg-primary/5 shadow-lg">
                <CardHeader><CardTitle className="flex items-center gap-2 text-primary font-headline"><Bot className="h-5 w-5" />Анализ миссии</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {aiResponse.warnings.length > 0 && (
                        <Alert variant="destructive" className="bg-destructive/10">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Критические предупреждения</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc pl-5 text-xs space-y-1 mt-2">
                                    {aiResponse.warnings.map((w,i) => <li key={i}>{w}</li>)}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                    <Alert className="bg-background/50">
                        <Info className="h-4 w-4 text-primary" />
                        <AlertTitle className="text-primary">Заметки о полете</AlertTitle>
                        <AlertDescription className="text-xs leading-relaxed mt-1">
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
