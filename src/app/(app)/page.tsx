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
    title: 'UAV Model & Payload Editor',
    description: 'Configure UAV types, parameters, and sensor payloads.',
    icon: SlidersHorizontal,
    href: '/editor',
  },
  {
    title: 'AI Mission Planner',
    description: 'Plan safe and optimal flight paths with AI assistance.',
    icon: Map,
    href: '/planner',
  },
  {
    title: 'Virtual Flight Simulator',
    description: 'Execute and visualize missions in a real-time simulation.',
    icon: PlayCircle,
    href: '/simulator',
  },
  {
    title: 'NN Re-training Console',
    description: 'Monitor and initiate AI model re-training processes.',
    icon: BrainCircuit,
    href: '/retrain',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Welcome to SkyPilot AI"
        description="The integrated suite for designing, simulating, and refining autonomous UAV control systems."
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
                  Open Tool
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
