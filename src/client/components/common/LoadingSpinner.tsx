import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullPage?: boolean;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, fullPage, text }: LoadingSpinnerProps) {
  const sizeClasses = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-4' };

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div className={cn('animate-spin rounded-full border-gray-300 border-t-blue-600', sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="flex h-screen items-center justify-center">{spinner}</div>;
  }

  return spinner;
}
