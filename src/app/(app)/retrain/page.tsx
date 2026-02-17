'use client'

import * as React from 'react';
import { Bot, Wand2, Lightbulb, FlaskConical } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const formSchema = z.object({
  performanceSummary: z.string().min(10, 'Please provide a more detailed summary.'),
  keyMetrics: z.string().min(5, 'Please provide key metrics.'),
});

type AiSuggestions = {
    retrainingSuggestions: string[];
    dataAugmentationStrategies: string[];
    focusedRetrainingScenarios: string[];
    rationale: string;
};

const chartConfig = {
    loss: { label: 'Training Loss', color: 'hsl(var(--chart-1))' },
    accuracy: { label: 'Validation Accuracy', color: 'hsl(var(--chart-2))' },
};

export default function RetrainPage() {
    const [isLoading, setIsLoading = React.useState(false);
    const [aiSuggestions, setAiSuggestions = React.useState<AiSuggestions | null>(null);
    const [isTraining, setIsTraining = React.useState(false);
    const [trainingData, setTrainingData = React.useState<{epoch: number, loss: number, accuracy: number}[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            performanceSummary: 'During a test flight with Recon Drone Alpha in high winds, we observed oscillations during sharp turns and a 2.5m path deviation.',
            keyMetrics: '{"stabilityScore": 0.7, "pathDeviation_m": 2.5, "controlLatency_ms": 150}',
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        setAiSuggestions(null);
        // Mocking AI call to aiSuggestedRetrainingParams
        setTimeout(() => {
            setAiSuggestions({
                retrainingSuggestions: [
                    'Decrease learning rate to 0.0005 to fine-tune control.',
                    'Increase number of epochs to 75 for better convergence.',
                    'Switch to AdamW optimizer for better weight decay.'
                ],
                dataAugmentationStrategies: [
                    'Simulate high wind conditions (15-25 m/s) in training data.',
                    'Introduce random gusts and turbulence effects.',
                    'Add more scenarios with sharp, high-speed turns.'
                ],
                focusedRetrainingScenarios: [
                    'Validate performance in simulated urban canyons.',
                    'Test response to sudden payload shifts.',
                ],
                rationale: 'The observed oscillations and path deviation in high winds suggest the model is not robust enough to environmental disturbances. A lower learning rate and more targeted data augmentation will improve stability and precision.'
            });
            setIsLoading(false);
        }, 2000);
    };

     React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if(isTraining) {
            setTrainingData([]);
            let epoch = 0;
            timer = setInterval(() => {
                epoch++;
                setTrainingData(prev => [
                    ...prev,
                    {
                        epoch,
                        loss: 0.5 * Math.exp(-epoch / 20) + (Math.random() - 0.5) * 0.05,
                        accuracy: 0.8 * (1 - Math.exp(-epoch/15)) + (Math.random() - 0.5) * 0.03
                    }
                ]);
                if (epoch >= 50) {
                    clearInterval(timer);
                    setIsTraining(false);
                }
            }, 300);
        }
        return () => clearInterval(timer);
    }, [isTraining]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Neural Network Re-training Console"
        description="Analyze performance and get AI-powered suggestions for re-training control algorithms."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Performance Analysis Input</CardTitle>
                    <CardDescription>Provide data from a recent test flight to get AI retraining suggestions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             <FormField
                                control={form.control}
                                name="performanceSummary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Performance Summary</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe the UAV's performance, issues, etc." {...field} rows={4}/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="keyMetrics"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Key Performance Metrics (JSON)</FormLabel>
                                        <FormControl>
                                            <Input placeholder='e.g., {"stabilityScore": 0.7}' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <Button type="submit" disabled={isLoading}>
                                <Bot className="mr-2" />
                                {isLoading ? 'Analyzing...' : 'Get AI Suggestions'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            {isLoading && (
                 <Card>
                    <CardHeader>
                        <CardTitle>AI Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-8 w-1/2 mt-4" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                </Card>
            )}
            {aiSuggestions && (
                 <Card>
                    <CardHeader>
                        <CardTitle>AI Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2"><Wand2 className="text-primary"/>Retraining Suggestions</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {aiSuggestions.retrainingSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2"><FlaskConical className="text-primary"/>Data Augmentation</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {aiSuggestions.dataAugmentationStrategies.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle>Rationale</AlertTitle>
                            <AlertDescription>{aiSuggestions.rationale}</AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Training Progress</CardTitle>
                    <CardDescription>Monitor the re-training process in real-time.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <ChartContainer config={chartConfig} className="aspect-video w-full">
                        <LineChart data={trainingData}>
                            <XAxis dataKey="epoch" name="Epoch" />
                            <YAxis yAxisId="left" domain={[0, 1]}/>
                            <YAxis yAxisId="right" orientation="right" domain={[0.7, 1]}/>
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="loss" stroke="var(--color-loss)" dot={false} isAnimationActive={false} />
                            <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="var(--color-accuracy)" dot={false} isAnimationActive={false}/>
                        </LineChart>
                    </ChartContainer>
                     <Button onClick={() => setIsTraining(true)} disabled={isTraining}>
                        {isTraining ? 'Training...' : 'Start Re-training'}
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
