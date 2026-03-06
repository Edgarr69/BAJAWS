import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  color?: 'blue' | 'green' | 'red' | 'gray';
  loading?: boolean;
}

const colorMap = {
  blue:  'text-primary-700',
  green: 'text-accent-600',
  red:   'text-red-600',
  gray:  'text-slate-600',
};

export function KpiCard({ title, value, subtitle, color = 'blue', loading }: KpiCardProps) {
  return (
    <Card className="border-slate-200">
      <CardContent className="pt-5 pb-4 px-5">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{title}</p>
        {loading ? (
          <Skeleton className="h-9 w-24 mt-1" />
        ) : (
          <p className={cn('text-3xl font-bold', colorMap[color])}>{value}</p>
        )}
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
