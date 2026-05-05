import Link from 'next/link';
import {
  BrainCircuit,
  Map,
  PlayCircle,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';

const features = [
  {
    title: 'Редактор БПЛА и нагрузок',
    description: 'Конфигурация типов БПЛА, параметров и полезной нагрузки.',
    icon: SlidersHorizontal,
    href: '/editor',
  },
  {
    title: 'ИИ Планировщик миссий',
    description: 'Планирование безопасных и оптимальных маршрутов с помощью ИИ.',
    icon: Map,
    href: '/planner',
  },
  {
    title: 'Виртуальный симулятор',
    description: 'Выполнение и визуализация миссий в режиме реального времени.',
    icon: PlayCircle,
    href: '/simulator',
  },
  {
    title: 'Консоль переобучения НС',
    description: 'Мониторинг и запуск процесса дообучения нейросетевых моделей.',
    icon: BrainCircuit,
    href: '/retrain',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Добро пожаловать в SkyPilot AI"
        description="Интегрированная среда для проектирования, симуляции и совершенствования автономных систем управления БПЛА."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.href} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl font-headline">
                  {feature.title}
                </CardTitle>
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button asChild variant="outline" className="w-full">
                <Link href={feature.href}>
                  Открыть инструмент
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
