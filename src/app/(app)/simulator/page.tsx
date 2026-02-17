'use client'

import * as React from 'react';
import Image from 'next/image';
import { Play, Pause, FileText, Bot, Zap, Battery, Orbit, Wind } from 'lucide-react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Drone } from '@/components/icons';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const sensorImage = PlaceHolderImages.find((img) => img.id === 'sensor_feed');
const mapImage = PlaceHolderImages.find((img) => img.id === 'aerial_map');

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

    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if(isSimulating) {
            timer = setInterval(() => {
                setSimTime(t => t + 1);
                setProgress(p => (p >= 100 ? 0 : p + 1.66));
            }, 1000);
        }
        return () => clearInterval(timer);
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
        return () => clearInterval(testTimer);
    }, [isTesting]);

    const altitude = 60 + Math.sin(simTime / 5) * 10;
    const speed = 15 + Math.cos(simTime / 3) * 3;
    const battery = 100 - (progress * 0.7);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Virtual Flight Simulator"
        description="Execute planned missions in a real-time virtual environment or run accelerated tests."
      />
      <Tabs defaultValue="demonstration">
        <TabsList>
          <TabsTrigger value="demonstration">Demonstration</TabsTrigger>
          <TabsTrigger value="test_report">Test Report</TabsTrigger>
        </TabsList>
        <TabsContent value="demonstration" className="mt-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>3D Space Simulation (Side View)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full h-64 bg-muted rounded-lg overflow-hidden relative">
                                <div 
                                    className="absolute transition-all duration-1000 ease-linear"
                                    style={{
                                        left: `${progress}%`,
                                        bottom: `${altitude / 2}%`,
                                        transform: 'translate(-50%, 50%)'
                                    }}
                                >
                                    <Drone className="w-10 h-10 text-primary" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-foreground/5"></div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>Sensor Feed</CardTitle></CardHeader>
                            <CardContent>
                                {sensorImage && <Image src={sensorImage.imageUrl} alt="Sensor Feed" width={600} height={400} className="rounded-lg aspect-video object-cover" data-ai-hint={sensorImage.imageHint} />}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Map Position</CardTitle></CardHeader>
                            <CardContent>
                                <div className="relative aspect-video">
                                {mapImage && <Image src={mapImage.imageUrl} alt="Map" fill className="rounded-lg object-cover" data-ai-hint={mapImage.imageHint}/>}
                                 <div 
                                    className="absolute"
                                    style={{ left: `${10 + progress * 0.8}%`, top: `${20 + Math.sin(progress/10) * 10}%` }}
                                >
                                    <div className="w-4 h-4 rounded-full bg-primary border-2 border-primary-foreground"></div>
                                </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
                        <CardContent>
                            <Button onClick={() => setIsSimulating(!isSimulating)} className="w-full">
                                {isSimulating ? <><Pause className="mr-2"/>Pause</> : <><Play className="mr-2"/>Start</>} Simulation
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Flight Statistics</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-2"><Orbit/>Altitude</span><span className="font-mono">{altitude.toFixed(1)} m</span></div>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-2"><Wind/>Speed</span><span className="font-mono">{speed.toFixed(1)} m/s</span></div>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-2"><Zap/>Signal</span><span className="font-mono">98.5%</span></div>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-2"><Battery/>Battery</span><span className="font-mono">{battery.toFixed(1)}%</span></div>
                            <Progress value={battery} className="w-full" />
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
                            <FileText className="mr-2"/> Run Test
                        </Button>
                    )}
                    {isTesting && (
                        <div>
                            <p className="text-center mb-2">Test in progress...</p>
                            <Progress value={progress} className="w-full" />
                        </div>
                    )}
                    {testComplete && (
                        <div className="space-y-6">
                            <Alert variant="default" className="bg-secondary">
                                <Bot className="h-4 w-4" />
                                <AlertTitle>Test Complete!</AlertTitle>
                                <AlertDescription>
                                    The simulation finished successfully. Average path deviation was 0.28m with 95.8% stability.
                                </AlertDescription>
                            </Alert>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Performance Metrics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                     <ChartContainer config={chartConfig} className="aspect-video w-full">
                                        <LineChart data={testReportData} margin={{ left: 12, right: 12 }}>
                                            <XAxis dataKey="name" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip content={<ChartTooltipContent />} />
                                            <Legend />
                                            <Line yAxisId="left" type="monotone" dataKey="deviation" stroke="var(--color-deviation)" />
                                            <Line yAxisId="right" type="monotone" dataKey="stability" stroke="var(--color-stability)" />
                                        </LineChart>
                                    </ChartContainer>
                                </CardContent>
                             </Card>
                             <Button onClick={() => setTestComplete(false)}>Run Again</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
