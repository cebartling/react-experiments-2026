import { useSubmittableForm } from '../../hooks/useSubmittableForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { preferencesSchema } from '../../utils/validation-schemas';
import type { PreferencesFormData } from '../../utils/validation-schemas';
import { Card, CardHeader } from '../layout/Card';
import { FormField, Select, Checkbox } from './FormField';

const notificationOptions = [
  { value: 'all', label: 'All notifications' },
  { value: 'important', label: 'Important only' },
  { value: 'none', label: 'None' },
];

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System default' },
];

export function PreferencesForm() {
  const {
    register,
    formState: { errors, isSubmitting },
  } = useSubmittableForm<PreferencesFormData>({
    formId: 'preferences',
    displayName: 'Preferences',
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      newsletter: false,
      notifications: 'all',
      theme: 'system',
    },
  });

  return (
    <Card as="section" aria-labelledby="preferences-title" data-testid="preferences-form">
      <CardHeader title="Preferences" description="Customize your experience" />

      <fieldset disabled={isSubmitting}>
        <FormField
          label="Email Notifications"
          htmlFor="pref-notifications"
          error={errors.notifications}
        >
          <Select
            id="pref-notifications"
            {...register('notifications')}
            options={notificationOptions}
            hasError={!!errors.notifications}
            data-testid="pref-notifications-select"
          />
        </FormField>

        <FormField label="Theme" htmlFor="pref-theme" error={errors.theme}>
          <Select
            id="pref-theme"
            {...register('theme')}
            options={themeOptions}
            hasError={!!errors.theme}
            data-testid="pref-theme-select"
          />
        </FormField>

        <div className="mt-4">
          <Checkbox
            {...register('newsletter')}
            label="Subscribe to newsletter"
            data-testid="pref-newsletter-checkbox"
          />
        </div>
      </fieldset>
    </Card>
  );
}
