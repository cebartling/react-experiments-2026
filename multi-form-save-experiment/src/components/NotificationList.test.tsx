import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationList } from './NotificationList';
import type { ErrorNotification } from '../types/errors';

describe('NotificationList', () => {
  const mockNotifications: ErrorNotification[] = [
    {
      id: 'notif-1',
      severity: 'error',
      title: 'Error Title',
      message: 'Error message',
      dismissible: true,
    },
    {
      id: 'notif-2',
      severity: 'info',
      title: 'Success Title',
      message: 'Success message',
      dismissible: true,
    },
  ];

  it('renders nothing when there are no notifications', () => {
    const { container } = render(<NotificationList notifications={[]} onDismiss={() => {}} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders all notifications', () => {
    render(<NotificationList notifications={mockNotifications} onDismiss={() => {}} />);

    expect(screen.getByText('Error Title')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Success Title')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<NotificationList notifications={mockNotifications} onDismiss={() => {}} />);

    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications')).toHaveAttribute('aria-live', 'polite');
  });

  it('calls onDismiss with correct id when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<NotificationList notifications={mockNotifications} onDismiss={onDismiss} />);

    const dismissButtons = screen.getAllByRole('button', { name: 'Dismiss notification' });
    fireEvent.click(dismissButtons[0]);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith('notif-1');
  });

  it('shows dismiss button only for dismissible notifications', () => {
    const notifications: ErrorNotification[] = [
      {
        id: 'notif-1',
        severity: 'error',
        title: 'Dismissible',
        message: 'Can be dismissed',
        dismissible: true,
      },
      {
        id: 'notif-2',
        severity: 'warning',
        title: 'Non-dismissible',
        message: 'Cannot be dismissed',
        dismissible: false,
      },
    ];

    render(<NotificationList notifications={notifications} onDismiss={() => {}} />);

    const dismissButtons = screen.getAllByRole('button', { name: 'Dismiss notification' });
    expect(dismissButtons).toHaveLength(1);
  });

  it('applies correct styling for error severity', () => {
    const notifications: ErrorNotification[] = [
      {
        id: 'notif-1',
        severity: 'error',
        title: 'Error',
        message: 'Error message',
        dismissible: true,
      },
    ];

    render(<NotificationList notifications={notifications} onDismiss={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50');
    expect(alert).toHaveClass('border-red-200');
    expect(alert).toHaveClass('text-red-800');
  });

  it('applies correct styling for warning severity', () => {
    const notifications: ErrorNotification[] = [
      {
        id: 'notif-1',
        severity: 'warning',
        title: 'Warning',
        message: 'Warning message',
        dismissible: true,
      },
    ];

    render(<NotificationList notifications={notifications} onDismiss={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-amber-50');
    expect(alert).toHaveClass('border-amber-200');
    expect(alert).toHaveClass('text-amber-800');
  });

  it('applies correct styling for info severity', () => {
    const notifications: ErrorNotification[] = [
      {
        id: 'notif-1',
        severity: 'info',
        title: 'Info',
        message: 'Info message',
        dismissible: true,
      },
    ];

    render(<NotificationList notifications={notifications} onDismiss={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-emerald-50');
    expect(alert).toHaveClass('border-emerald-200');
    expect(alert).toHaveClass('text-emerald-800');
  });

  it('renders multiple notifications stacked', () => {
    render(<NotificationList notifications={mockNotifications} onDismiss={() => {}} />);

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(2);
  });
});
