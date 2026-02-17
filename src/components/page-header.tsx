import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  description: string;
  className?: string;
};

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h1 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        {title}
      </h1>
      <p className="text-lg text-muted-foreground">{description}</p>
    </div>
  );
}
