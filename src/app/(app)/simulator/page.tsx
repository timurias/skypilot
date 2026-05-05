'use client'

import * as React from 'react';
import { Play, Pause, FileText, Bot, Zap, Battery, Orbit, Wind, Video, Layers, Cpu, Eye, Map as MapIcon } from 'lucide-react';
import { Line, LineChart, XAxis, YAxis, Tooltip, Legend } from 'recharts';

import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const testReportData = [
    { name: '0s', deviation: 0, stability: 98 },
    { name: '10s', deviation: 0.2, stability: 97 },
    { name: '20s', deviation: 0.1, stability: 99 },
    { name: '30s', deviation: 0.5, stability: 92 },
    { name: '40s', deviation: 0.3, stability: 95 },
    { name: '50s', deviation: 0.4, stability: 94 },
    { name: '60s', deviation: 0.2, stability: 97 },
]

const chartConfig = {
    deviation: { label: 'Path Deviation (m)', color: 'hsl(var(--chart-1))' },
    stability: { label: 'Stability (%)', color: 'hsl(var(--chart-2))' },
};

export default function SimulatorPage() {
    const [isSimulating, setIsSimulating] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [simTime, setSimTime] = React.useState(0);
    const [isTesting, setIsTesting] = React.useState(false);
    const [testComplete, setTestComplete] = React.useState(false);

    // Video references for synchronized playback
    const rgbRef = React.useRef<HTMLVideoElement>(null);
    const depthRef = React.useRef<HTMLVideoElement>(null);
    const sensorsRef = React.useRef<HTMLVideoElement>(null);
    const lidarRef = React.useRef<HTMLVideoElement>(null);
    const mapViewRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        const vids = [rgbRef.current, depthRef.current, sensorsRef.current, lidarRef.current, mapViewRef.current];

        if(isSimulating) {
            timer = setInterval(() => {
                setSimTime(t => t + 1);
                setProgress(p => (p >= 100 ? 0 : p + 0.5));
            }, 1000);

            vids.forEach(v => v?.play().catch(() => {}));
        } else {
            vids.forEach(v => v?.pause());
        }
        return () => {
          if (timer) clearInterval(timer);
        };
    }, [isSimulating]);
    
    React.useEffect(() => {
        let testTimer: NodeJS.Timeout;
        if(isTesting) {
            setTestComplete(false);
            setProgress(0);
            testTimer = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) {
                        clearInterval(testTimer);
                        setIsTesting(false);
                        setTestComplete(true);
                        return 100;
                    }
                    return p + 5;
                });
            }, 200);
        }
        return () => {
          if (testTimer) clearInterval(testTimer);
        };
    }, [isTesting]);

    const altitude = 60 + Math.sin(simTime / 5) * 10;
    const speed = 15 + Math.cos(simTime / 3) * 3;
    const battery = Math.max(0, 100 - (progress * 0.7));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Virtual Flight Simulator"
        description="Execute planned missions in a real-time virtual environment with multiple sensor feeds."
      />
      <Tabs defaultValue="demonstration">
        <TabsList>
          <TabsTrigger value="demonstration">Live Simulation</TabsTrigger>
          <TabsTrigger value="test_report">Test Report</TabsTrigger>
        </TabsList>
        <TabsContent value="demonstration" className="mt-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
                <div className="lg:col-span-3 space-y-6">
                    <Tabs defaultValue="visuals">
                        <TabsList className="mb-4">
                            <TabsTrigger value="visuals">Visual Feeds</TabsTrigger>
                            <TabsTrigger value="sensors">Sensor Cluster</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="visuals" className="space-y-6">
                            {/* Primary RGB Feed */}
                            <Card className="overflow-hidden border-primary/20">
                                <CardHeader className="bg-muted/50 py-3 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Video className="w-4 h-4 text-primary" />
                                        Main RGB Camera Feed
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 bg-black aspect-video relative">
                                    <video 
                                        ref={rgbRef}
                                        src="/videos_simulations/rgb_view.mp4" 
                                        className="w-full h-full object-cover"
                                        loop
                                        muted
                                        playsInline
                                    />
                                    {!isSimulating && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                                            <p className="text-white font-medium">Simulation Paused</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Grid of other visual feeds */}
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                                <Card className="overflow-hidden">
                                    <CardHeader className="bg-muted/50 py-2 px-3">
                                        <CardTitle className="text-xs font-medium flex items-center gap-2">
                                            <Layers className="w-3 h-3" />
                                            Depth Map
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 bg-black aspect-video">
                                        <video 
                                            ref={depthRef}
                                            src="/videos_simulations/Depth_map.webm" 
                                            className="w-full h-full object-cover"
                                            loop
                                            muted
                                            playsInline
                                        />
                                    </CardContent>
                                </Card>
                                <Card className="overflow-hidden">
                                    <CardHeader className="bg-muted/50 py-2 px-3">
                                        <CardTitle className="text-xs font-medium flex items-center gap-2">
                                            <Eye className="w-3 h-3" />
                                            Lidar Scan
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 bg-black aspect-video">
                                        <video 
                                            ref={lidarRef}
                                            src="/videos_simulations/Lidar.webm" 
                                            className="w-full h-full object-cover"
                                            loop
                                            muted
                                            playsInline
                                        />
                                    </CardContent>
                                </Card>
                                <Card className="overflow-hidden">
                                    <CardHeader className="bg-muted/50 py-2 px-3">
                                        <CardTitle className="text-xs font-medium flex items-center gap-2">
                                            <MapIcon className="w-3 h-3" />
                                            Map View
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 bg-black aspect-video">
                                        <video 
                                            ref={mapViewRef}
                                            src="/videos_simulations/Map_view.webm" 
                                            className="w-full h-full object-cover"
                                            loop
                                            muted
                                            playsInline
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="sensors">
                            <Card className="overflow-hidden border-primary/20">
                                <CardHeader className="bg-muted/50 py-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Cpu className="w-4 h-4 text-primary" />
                                        Integrated Sensor Cluster Data
                                    </CardTitle>
                                    <CardDescription>Consolidated telemetry and neural network decision matrices.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 bg-black aspect-video relative">
                                    <video 
                                        ref={sensorsRef}
                                        src="/videos_simulations/Sensors.webm" 
                                        className="w-full h-full object-contain"
                                        loop
                                        muted
                                        playsInline
                                    />
                                     {!isSimulating && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                                            <p className="text-white font-medium">Sensor Stream Paused</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mission Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button onClick={() => setIsSimulating(!isSimulating)} className="w-full h-12 text-lg font-semibold" variant={isSimulating ? "outline" : "default"}>
                                {isSimulating ? <><Pause className="mr-2 h-5 w-5"/>Pause</> : <><Play className="mr-2 h-5 w-5"/>Start</>} Simulation
                            </Button>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Mission Progress</span>
                                    <span>{progress.toFixed(0)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Telemetry Data</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-2"><Orbit className="w-4 h-4"/>Altitude</span><span className="font-mono">{altitude.toFixed(1)} m</span></div>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-2"><Wind className="w-4 h-4"/>Speed</span><span className="font-mono">{speed.toFixed(1)} m/s</span></div>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-2"><Zap className="w-4 h-4"/>Signal</span><span className="font-mono">98.5%</span></div>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-2"><Battery className="w-4 h-4"/>Battery</span><span className="font-mono">{battery.toFixed(1)}%</span></div>
                            <Progress value={battery} className="w-full h-1" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Alerts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <div className="p-2 rounded bg-green-500/10 text-green-500 text-xs border border-green-500/20">
                                IMU: Normal stability detected
                             </div>
                             <div className="p-2 rounded bg-blue-500/10 text-blue-500 text-xs border border-blue-500/20">
                                GPS: High precision lock (12 sats)
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>
        <TabsContent value="test_report" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Accelerated Background Test</CardTitle>
                    <CardDescription>Run the mission in a fast, non-visual mode to get a performance report.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!isTesting && !testComplete && (
                        <Button onClick={() => setIsTesting(true)}>
                            <FileText className="mr-2"/> Run Automated Test
                        </Button>
                    )}
                    {isTesting && (
                        <div>
                            <p className="text-center mb-2">Simulating mission parameters...</p>
                            <Progress value={progress} className="w-full" />
                        </div>
                    )}
                    {testComplete && (
                        <div className="space-y-6">
                            <div className="p-4 rounded-lg bg-secondary flex items-start gap-4">
                                <Bot className="h-5 w-5 mt-1 text-primary" />
                                <div>
                                    <h4 className="font-bold">Test Results Summary</h4>
                                    <p className="text-sm text-muted-foreground">
                                        The simulation finished successfully. Average path deviation was 0.28m with 95.8% stability.
                                    </p>
                                </div>
                            </div>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Stability & Accuracy Metrics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                     <ChartContainer config={chartConfig} className="aspect-video w-full">
                                        <LineChart data={testReportData} margin={{ left: 12, right: 12 }}>
                                            <XAxis dataKey="name" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip content={<ChartTooltipContent />} />
                                            <Legend />
                                            <Line yAxisId="left" type="monotone" dataKey="deviation" stroke="var(--color-deviation)" strokeWidth={2} />
                                            <Line yAxisId="right" type="monotone" dataKey="stability" stroke="var(--color-stability)" strokeWidth={2} />
                                        </LineChart>
                                     </ChartContainer>
                                </CardContent>
                             </Card>
                             <Button onClick={() => setTestComplete(false)}>Reset Simulation</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
