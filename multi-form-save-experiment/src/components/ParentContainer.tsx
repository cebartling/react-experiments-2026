import { useCallback, useMemo } from 'react';
import { useFormCoordinationStore } from '../stores/formCoordinationStore';
import { useErrorHandling } from '../hooks/useErrorHandling';
import { Container } from './layout/Container';
import { SaveButton } from './SaveButton';
import { ErrorSummary } from './ErrorSummary';
import { NotificationList } from './NotificationList';
import { UserInfoForm } from './forms/UserInfoForm';
import { AddressForm } from './forms/AddressForm';
import { PreferencesForm } from './forms/PreferencesForm';
import { FormErrorBoundary } from './FormErrorBoundary';

export function ParentContainer() {
  const saveAllChanges = useFormCoordinationStore((state) => state.saveAllChanges);
  const dirtyForms = useFormCoordinationStore((state) => state.dirtyForms);
  const dirtyFormCount = useMemo(() => dirtyForms.size, [dirtyForms]);

  const { validationErrors, submissionErrors, notifications, dismissNotification, clearAllErrors } =
    useErrorHandling();

  const handleSave = useCallback(async () => {
    await saveAllChanges();
  }, [saveAllChanges]);

  return (
    <Container className="py-8 sm:py-12" data-testid="parent-container">
      <NotificationList notifications={notifications} onDismiss={dismissNotification} />

      <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
            Multi-Form Editor
          </h1>
          {dirtyFormCount > 0 && (
            <p
              className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-amber-600"
              data-testid="dirty-form-count"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
              </span>
              Unsaved changes in {dirtyFormCount} form{dirtyFormCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <SaveButton onSave={handleSave} />
      </header>

      <ErrorSummary
        validationErrors={validationErrors}
        submissionErrors={submissionErrors}
        onDismiss={clearAllErrors}
      />

      <div className="space-y-6 sm:space-y-8" data-testid="forms-container">
        <FormErrorBoundary>
          <UserInfoForm />
        </FormErrorBoundary>

        <FormErrorBoundary>
          <AddressForm />
        </FormErrorBoundary>

        <FormErrorBoundary>
          <PreferencesForm />
        </FormErrorBoundary>
      </div>
    </Container>
  );
}
