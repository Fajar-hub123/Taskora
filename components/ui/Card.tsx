import { HTMLAttributes } from 'react';
import clsx from 'clsx';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('glass card-pad rounded-xl2 p-5 shadow-glass', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={clsx('font-display text-sm font-semibold text-ink-muted uppercase tracking-wide', className)} {...props} />;
}
