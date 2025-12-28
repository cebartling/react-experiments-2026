import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTrackedForm } from './useTrackedForm';
import { useFormCoordinationStore } from '../stores/formCoordinationStore';

interface TestFormData {
  name: string;
  email: string;
}

function TestForm({ formId }: { formId: string }) {
  const {
    register,
    formState: { isDirty },
    reset,
  } = useTrackedForm<TestFormData>({
    formId,
    defaultValues: { name: '', email: '' },
  });

  return (
    <form>
      <input {...register('name')} data-testid="name-input" />
      <input {...register('email')} data-testid="email-input" />
      <span data-testid="is-dirty">{isDirty ? 'dirty' : 'clean'}</span>
      <button type="button" onClick={() => reset()} data-testid="reset-button">
        Reset
      </button>
    </form>
  );
}

describe('useTrackedForm', () => {
  beforeEach(() => {
    useFormCoordinationStore.getState().resetAllDirtyState();
  });

  it('reports dirty state when form values change', async () => {
    const user = userEvent.setup();
    render(<TestForm formId="test-form" />);

    const nameInput = screen.getByTestId('name-input');

    await user.type(nameInput, 'John');

    await waitFor(() => {
      expect(useFormCoordinationStore.getState().dirtyForms.has('test-form')).toBe(true);
    });
  });

  it('reports clean state when form is reset', async () => {
    const user = userEvent.setup();
    render(<TestForm formId="test-form" />);

    const nameInput = screen.getByTestId('name-input');
    const resetButton = screen.getByTestId('reset-button');

    await user.type(nameInput, 'John');

    await waitFor(() => {
      expect(useFormCoordinationStore.getState().dirtyForms.has('test-form')).toBe(true);
    });

    await user.click(resetButton);

    await waitFor(() => {
      expect(useFormCoordinationStore.getState().dirtyForms.has('test-form')).toBe(false);
    });
  });

  it('removes form from dirty set when unmounted', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<TestForm formId="test-form" />);

    const nameInput = screen.getByTestId('name-input');
    await user.type(nameInput, 'John');

    await waitFor(() => {
      expect(useFormCoordinationStore.getState().dirtyForms.has('test-form')).toBe(true);
    });

    unmount();

    expect(useFormCoordinationStore.getState().dirtyForms.has('test-form')).toBe(false);
  });

  it('tracks multiple forms independently', async () => {
    const user = userEvent.setup();
    render(
      <>
        <div data-testid="form-1">
          <TestForm formId="form-1" />
        </div>
        <div data-testid="form-2">
          <TestForm formId="form-2" />
        </div>
      </>
    );

    const nameInputs = screen.getAllByTestId('name-input');

    await user.type(nameInputs[0], 'John');

    await waitFor(() => {
      const state = useFormCoordinationStore.getState();
      expect(state.dirtyForms.has('form-1')).toBe(true);
      expect(state.dirtyForms.has('form-2')).toBe(false);
    });
  });
});
