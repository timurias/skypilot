'use client'

import * as React from 'react';
import { Play, Pause, RefreshCcw } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '@/context/app-context';
import { controlAlgorithmsHierarchy } from '@/lib/data';

export default function SimulatorPage() {
    const { configs, selectedConfigId, resetAll } = useAppContext();
    const [isSimulating, setIsSimulating] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [simTime, setSimTime] = React.useState(0);

    const activeConfig = configs.find(c => c.id === selectedConfigId);

    const rgbRef = React.useRef<HTMLVideoElement>(null);
    const depthRef = React.useRef<HTMLVideoElement>(null);
    const sensorsRef = React.useRef<HTMLVideoElement>(null);
    const lidarRef = React.useRef<HTMLVideoElement>(null);
    const mapViewRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if(isSimulating) {
            timer = setInterval(() => {
                setSimTime(t => t + 1);
                setProgress(p => (p >= 100 ? 0 : p + 0.2));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isSimulating]);

    React.useEffect(() => {
        const vids = [rgbRef.current, depthRef.current, sensorsRef.current, lidarRef.current, mapViewRef.current];
        vids.forEach(v => {
            if (!v) return;
            if (isSimulating) {
                v.play().catch(() => {});
            } else {
                v.pause();
            }
        });
    }, [isSimulating]);

    const altitude = 60 + Math.sin(simTime / 5) * 5;
    const speed = (activeConfig?.type === 'ST' ? 25 : 12) + Math.cos(simTime / 3) * 2;
    const battery = Math.max(0, 100 - (progress * 0.5));

    // Названия алгоритмов для отображения в телеметрии
    const getAlgoNames = () => {
        if (!activeConfig?.algorithmIds) return 'Не выбрано';
        const allAlgos = [
            ...controlAlgorithmsHierarchy.lowLevel.classical.items,
            ...controlAlgorithmsHierarchy.lowLevel.neural.items,
            ...controlAlgorithmsHierarchy.highLevel.items
        ];
        return activeConfig.algorithmIds
            .map(id => allAlgos.find(a => a.id === id)?.name)
            .filter(Boolean)
            .join(', ');
    };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Симулятор"
          description={`Тестирование ${activeConfig?.name || 'БПЛА'} по заданному маршруту.`}
        />
        <Button variant="outline" size="sm" onClick={resetAll} className="gap-2">
           <RefreshCcw className="h-4 w-4" /> Обновить всё
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Tabs defaultValue="visuals">
            <TabsList className="mb-4">
              <TabsTrigger value="visuals">Видеопотоки</TabsTrigger>
              <TabsTrigger value="sensors">Кластер датчиков</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visuals" className="space-y-6">
              <Card className="overflow-hidden border-primary/20 bg-black aspect-video relative">
                <video ref={rgbRef} src="/videos_simulations/rgb_view.mp4" className="w-full h-full object-cover" loop muted playsInline />
                {!isSimulating && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10"><p className="text-white font-bold">ОЖИДАНИЕ ЗАПУСКА</p></div>}
              </Card>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {[
                  { ref: depthRef, src: '/videos_simulations/Depth_map.webm', label: 'Карта глубин' },
                  { ref: lidarRef, src: '/videos_simulations/Lidar.webm', label: 'Лидар' },
                  { ref: mapViewRef, src: '/videos_simulations/Map_view.webm', label: 'Вид сверху' }
                ].map((vid, i) => (
                  <Card key={i} className="overflow-hidden bg-black aspect-video relative">
                    <video ref={vid.ref} src={vid.src} className="w-full h-full object-cover" loop muted playsInline />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 text-[10px] text-white rounded">{vid.label}</div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sensors">
              <Card className="overflow-hidden border-primary/20 bg-black aspect-video relative">
                <video ref={sensorsRef} src="/videos_simulations/Sensors.webm" className="w-full h-full object-contain" loop muted playsInline />
                {!isSimulating && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10"><p className="text-white font-bold">ДАННЫЕ ТЕЛЕМЕТРИИ ПРИОСТАНОВЛЕНЫ</p></div>}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Управление</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={() => setIsSimulating(!isSimulating)} className="w-full h-12 text-lg font-bold" variant={isSimulating ? "outline" : "default"}>
                    {isSimulating ? <><Pause className="mr-2 h-5 w-5"/>Пауза</> : <><Play className="mr-2 h-5 w-5"/>Запуск</>}
                </Button>
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold"><span>Миссия</span><span>{progress.toFixed(0)}%</span></div>
                    <Progress value={progress} className="h-1.5" />
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Телеметрия</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Высота:</span><span className="font-mono">{altitude.toFixed(1)} м</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Скорость:</span><span className="font-mono">{speed.toFixed(1)} м/с</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Заряд:</span><span className="font-mono">{battery.toFixed(1)}%</span></div>
                <Progress value={battery} className="h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Активные системы</CardTitle></CardHeader>
            <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                <div className="text-[10px] p-2 rounded bg-green-500/10 text-green-500 border border-green-500/20">GPS: 12 Спутников (Active)</div>
                <div className="text-[10px] p-2 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">Link: 98% (Stable)</div>
                <div className="text-[10px] p-2 rounded bg-primary/10 text-primary border border-primary/20 uppercase font-bold leading-tight">
                    Алгоритмы: {getAlgoNames()}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
