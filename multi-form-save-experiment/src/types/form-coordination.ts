/**
 * Represents a unique identifier for each child form
 */
export type FormId = string;

/**
 * Callback type for notifying parent of dirty state changes
 */
export type DirtyChangeCallback = (formId: FormId, isDirty: boolean) => void;

/**
 * Props interface for child forms that participate in dirty tracking
 */
export interface DirtyTrackingProps {
  formId: FormId;
  onDirtyChange: DirtyChangeCallback;
}

/**
 * State shape for the form coordination store.
 * Note: isDirty is computed via the selectIsDirty selector.
 */
export interface FormCoordinationState {
  dirtyForms: Set<FormId>;
  markFormDirty: (formId: FormId) => void;
  markFormClean: (formId: FormId) => void;
  resetAllDirtyState: () => void;
}

/**
 * Represents a single field-level validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Result of validating a single form
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Summary of validation results for display in error summary
 */
export interface FormValidationSummary {
  formId: FormId;
  formName: string;
  errors: ValidationError[];
}

/**
 * Interface that child forms must implement for validation coordination
 */
export interface ValidatableForm {
  validate: () => Promise<ValidationResult>;
}

/**
 * Result of submitting a single form
 */
export interface SubmitResult {
  success: boolean;
  formId: FormId;
  error?: string;
  data?: unknown;
}

/**
 * Interface that child forms must implement for submission coordination
 */
export interface SubmittableForm {
  submit: () => Promise<SubmitResult>;
  getFormData: () => unknown;
}

/**
 * Registry entry for a validatable and submittable form
 */
export interface FormRegistryEntry {
  formId: FormId;
  displayName: string;
  validate: () => Promise<ValidationResult>;
  submit: () => Promise<SubmitResult>;
}

/**
 * Overall submission status
 */
export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Summary of submission results
 */
export interface SubmissionSummary {
  status: SubmissionStatus;
  successfulForms: FormId[];
  failedForms: SubmitResult[];
}
