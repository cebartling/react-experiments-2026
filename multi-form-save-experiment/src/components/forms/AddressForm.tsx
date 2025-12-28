import { useSubmittableForm } from '../../hooks/useSubmittableForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '../../utils/validation-schemas';
import type { AddressFormData } from '../../utils/validation-schemas';
import { Card, CardHeader } from '../layout/Card';
import { FormField, Input } from './FormField';

export function AddressForm() {
  const {
    register,
    formState: { errors, isSubmitting },
  } = useSubmittableForm<AddressFormData>({
    formId: 'address',
    displayName: 'Address',
    resolver: zodResolver(addressSchema),
    defaultValues: { street: '', city: '', state: '', zipCode: '' },
  });

  return (
    <Card as="section" aria-labelledby="address-title" data-testid="address-form">
      <CardHeader title="Address" description="Enter your mailing address" />

      <fieldset disabled={isSubmitting}>
        <FormField label="Street Address" htmlFor="address-street" error={errors.street} required>
          <Input
            id="address-street"
            {...register('street')}
            hasError={!!errors.street}
            placeholder="123 Main St"
            data-testid="address-street-input"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="City" htmlFor="address-city" error={errors.city} required>
            <Input
              id="address-city"
              {...register('city')}
              hasError={!!errors.city}
              placeholder="New York"
              data-testid="address-city-input"
            />
          </FormField>

          <FormField label="State" htmlFor="address-state" error={errors.state} required>
            <Input
              id="address-state"
              {...register('state')}
              hasError={!!errors.state}
              placeholder="NY"
              data-testid="address-state-input"
            />
          </FormField>
        </div>

        <FormField label="ZIP Code" htmlFor="address-zip" error={errors.zipCode} required>
          <Input
            id="address-zip"
            {...register('zipCode')}
            hasError={!!errors.zipCode}
            placeholder="10001"
            data-testid="address-zip-input"
          />
        </FormField>
      </fieldset>
    </Card>
  );
}
