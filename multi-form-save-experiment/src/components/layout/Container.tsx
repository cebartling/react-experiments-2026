import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export function Container({ children, className = '', 'data-testid': testId }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 ${className}`}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
