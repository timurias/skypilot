'use client'

import * as React from 'react';
import { Bot, Wand2, Lightbulb, FlaskConical } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Line, LineChart, XAxis, YAxis, Tooltip, Legend } from 'recharts';

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
  performanceSummary: z.string().min(10, 'Пожалуйста, предоставьте более детальный отчет.'),
  keyMetrics: z.string().min(5, 'Укажите ключевые метрики.'),
});

type AiSuggestions = {
    retrainingSuggestions: string[];
    dataAugmentationStrategies: string[];
    focusedRetrainingScenarios: string[];
    rationale: string;
};

const chartConfig = {
    loss: { label: 'Ошибка обучения', color: 'hsl(var(--chart-1))' },
    accuracy: { label: 'Точность валидации', color: 'hsl(var(--chart-2))' },
};

export default function RetrainPage() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [aiSuggestions, setAiSuggestions] = React.useState<AiSuggestions | null>(null);
    const [isTraining, setIsTraining] = React.useState(false);
    const [trainingData, setTrainingData] = React.useState<{epoch: number, loss: number, accuracy: number}[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            performanceSummary: 'Во время тестового полета Recon Drone Alpha при сильном ветре наблюдались осцилляции при резких поворотах и отклонение от маршрута на 2.5м.',
            keyMetrics: '{"stabilityScore": 0.7, "pathDeviation_m": 2.5, "controlLatency_ms": 150}',
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        setAiSuggestions(null);
        // Mocking AI call
        setTimeout(() => {
            setAiSuggestions({
                retrainingSuggestions: [
                    'Снизить learning rate до 0.0005 для более тонкой настройки управления.',
                    'Увеличить количество эпох до 75 для лучшей сходимости.',
                    'Перейти на оптимизатор AdamW для лучшего затухания весов.'
                ],
                dataAugmentationStrategies: [
                    'Симулировать условия сильного ветра (15-25 м/с) в обучающих данных.',
                    'Добавить случайные порывы ветра и эффекты турбулентности.',
                    'Добавить больше сценариев с резкими высокоскоростными поворотами.'
                ],
                focusedRetrainingScenarios: [
                    'Проверить производительность в симулируемых городских каньонах.',
                    'Протестировать реакцию на внезапные смещения полезной нагрузки.',
                ],
                rationale: 'Наблюдаемые осцилляции и отклонения при сильном ветре указывают на недостаточную устойчивость модели к внешним помехам. Более низкая скорость обучения и целевая аугментация данных улучшат стабильность и точность.'
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
        title="Консоль дообучения нейросети"
        description="Анализируйте производительность и получайте ИИ-рекомендации по дообучению алгоритмов управления."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Данные для анализа</CardTitle>
                    <CardDescription>Предоставьте данные последнего теста для получения рекомендаций.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             <FormField
                                control={form.control}
                                name="performanceSummary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Краткий отчет о работе</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Опишите работу БПЛА, проблемы и т.д." {...field} rows={4}/>
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
                                        <FormLabel>Ключевые метрики (JSON)</FormLabel>
                                        <FormControl>
                                            <Input placeholder='например, {"stabilityScore": 0.7}' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <Button type="submit" disabled={isLoading}>
                                <Bot className="mr-2" />
                                {isLoading ? 'Анализ...' : 'Получить ИИ рекомендации'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            {isLoading && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Рекомендации ИИ</CardTitle>
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
                        <CardTitle>Рекомендации ИИ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2"><Wand2 className="text-primary"/>Параметры обучения</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {aiSuggestions.retrainingSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2"><FlaskConical className="text-primary"/>Аугментация данных</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {aiSuggestions.dataAugmentationStrategies.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle>Обоснование</AlertTitle>
                            <AlertDescription>{aiSuggestions.rationale}</AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Прогресс дообучения</CardTitle>
                    <CardDescription>Мониторинг процесса дообучения в реальном времени.</CardDescription>
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
                        {isTraining ? 'Дообучение...' : 'Начать дообучение'}
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
