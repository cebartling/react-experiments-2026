import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
  'data-testid'?: string;
}

export function Card({
  children,
  className = '',
  as: Component = 'div',
  'data-testid': testId,
}: CardProps) {
  return (
    <Component
      className={`
        rounded-xl border border-surface-200 bg-white p-6 shadow-card
        transition-shadow duration-200 hover:shadow-card-hover
        sm:p-8
        ${className}
      `}
      data-testid={testId}
    >
      {children}
    </Component>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function CardHeader({ title, description, actions }: CardHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between border-b border-surface-100 pb-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-surface-900">{title}</h2>
        {description && (
          <p className="mt-1.5 text-sm font-medium text-surface-500">{description}</p>
        )}
      </div>
      {actions && <div className="ml-4">{actions}</div>}
    </div>
  );
}
