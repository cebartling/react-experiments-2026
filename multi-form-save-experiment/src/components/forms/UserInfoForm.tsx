import { useSubmittableForm } from '../../hooks/useSubmittableForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { userInfoSchema } from '../../utils/validation-schemas';
import type { UserInfoFormData } from '../../utils/validation-schemas';
import { Card, CardHeader } from '../layout/Card';
import { FormField, Input } from './FormField';

export function UserInfoForm() {
  const {
    register,
    formState: { errors, isSubmitting },
  } = useSubmittableForm<UserInfoFormData>({
    formId: 'userInfo',
    displayName: 'User Information',
    resolver: zodResolver(userInfoSchema),
    defaultValues: { name: '', email: '' },
  });

  return (
    <Card as="section" aria-labelledby="user-info-title" data-testid="user-info-form">
      <CardHeader title="User Information" description="Enter your personal details" />

      <fieldset disabled={isSubmitting}>
        <FormField label="Name" htmlFor="user-name" error={errors.name} required>
          <Input
            id="user-name"
            {...register('name')}
            hasError={!!errors.name}
            placeholder="John Doe"
            aria-describedby={errors.name ? 'user-name-error' : undefined}
            data-testid="user-name-input"
          />
        </FormField>

        <FormField label="Email" htmlFor="user-email" error={errors.email} required>
          <Input
            id="user-email"
            type="email"
            {...register('email')}
            hasError={!!errors.email}
            placeholder="john@example.com"
            aria-describedby={errors.email ? 'user-email-error' : undefined}
            data-testid="user-email-input"
          />
        </FormField>
      </fieldset>
    </Card>
  );
}
