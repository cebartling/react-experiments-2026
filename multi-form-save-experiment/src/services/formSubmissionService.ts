import type { SubmitResult, FormId } from '../types/form-coordination';

interface ApiResponse {
  success: boolean;
  id?: string;
  message?: string;
  error?: string;
}

const FORM_ENDPOINTS: Record<string, string> = {
  userInfo: '/api/forms/user-info',
  address: '/api/forms/address',
  preferences: '/api/forms/preferences',
};

/**
 * Submits form data to the appropriate API endpoint
 */
export async function submitForm<T>(formId: FormId, data: T): Promise<SubmitResult> {
  const endpoint = FORM_ENDPOINTS[formId];

  if (!endpoint) {
    return {
      success: false,
      formId,
      error: `Unknown form ID: ${formId}`,
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        formId,
        error: result.error ?? `Server returned ${response.status}`,
      };
    }

    return {
      success: true,
      formId,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      formId,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
