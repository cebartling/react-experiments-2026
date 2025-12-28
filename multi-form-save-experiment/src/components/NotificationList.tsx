import type { ErrorNotification } from '../types/errors';

interface NotificationListProps {
  notifications: ErrorNotification[];
  onDismiss: (id: string) => void;
}

export function NotificationList({ notifications, onDismiss }: NotificationListProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed right-4 top-20 z-50 flex flex-col gap-3 sm:right-6"
      data-testid="notification-list"
    >
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationProps {
  notification: ErrorNotification;
  onDismiss: () => void;
}

function Notification({ notification, onDismiss }: NotificationProps) {
  const { severity, title, message, dismissible } = notification;

  const severityStyles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    info: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  };

  const iconBgStyles = {
    error: 'bg-red-100',
    warning: 'bg-amber-100',
    info: 'bg-emerald-100',
  };

  const iconPaths = {
    error:
      'M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z',
    warning:
      'M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z',
    info: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z',
  };

  return (
    <div
      className={`flex w-80 items-start gap-3 rounded-xl border p-4 shadow-lg transition-all duration-300 animate-in slide-in-from-right ${severityStyles[severity]}`}
      role="alert"
    >
      <div className={`flex-shrink-0 rounded-full p-1.5 ${iconBgStyles[severity]}`}>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d={iconPaths[severity]} clipRule="evenodd" />
        </svg>
      </div>

      <div className="flex-1 pt-0.5">
        <p className="text-sm font-semibold tracking-tight">{title}</p>
        <p className="mt-1 text-sm opacity-80">{message}</p>
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 rounded-lg p-1 opacity-60 transition-all hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
          aria-label="Dismiss notification"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      )}
    </div>
  );
}
