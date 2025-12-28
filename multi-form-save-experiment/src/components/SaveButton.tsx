import { useFormCoordinationStore } from '../stores/formCoordinationStore';

interface SaveButtonProps {
  onSave: () => Promise<void>;
}

export function SaveButton({ onSave }: SaveButtonProps) {
  const isDirty = useFormCoordinationStore((state) => state.dirtyForms.size > 0);
  const isValidating = useFormCoordinationStore((state) => state.isValidating);
  const submissionStatus = useFormCoordinationStore((state) => state.submissionStatus);

  const isProcessing = isValidating || submissionStatus === 'submitting';
  const isDisabled = !isDirty || isProcessing;

  const getButtonText = () => {
    if (isValidating) return 'Validating...';
    if (submissionStatus === 'submitting') return 'Saving...';
    return 'Save All Changes';
  };

  return (
    <button
      type="button"
      onClick={onSave}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5
        text-sm font-semibold tracking-tight
        shadow-button transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${
          isDisabled
            ? 'cursor-not-allowed border border-surface-200 bg-surface-100 text-surface-400'
            : 'border border-transparent bg-primary-600 text-white hover:bg-primary-700 hover:shadow-button-hover active:bg-primary-800 active:scale-[0.98]'
        }
      `}
      aria-busy={isProcessing}
      data-testid="save-button"
    >
      {isProcessing && (
        <svg
          className="h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {getButtonText()}
    </button>
  );
}
