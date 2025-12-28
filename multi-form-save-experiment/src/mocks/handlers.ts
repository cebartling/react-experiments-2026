import { http, HttpResponse, delay } from 'msw';

interface FormSubmission {
  formId: string;
  data: unknown;
}

// Simulated database
const submissions: Map<string, FormSubmission[]> = new Map();

export const handlers = [
  // User Info Form endpoint
  http.post('/api/forms/user-info', async ({ request }) => {
    await delay(500); // Simulate network latency

    const data = await request.json();

    const existing = submissions.get('user-info') ?? [];
    submissions.set('user-info', [...existing, { formId: 'userInfo', data }]);

    return HttpResponse.json({
      success: true,
      id: crypto.randomUUID(),
      message: 'User info saved successfully',
    });
  }),

  // Address Form endpoint
  http.post('/api/forms/address', async ({ request }) => {
    await delay(600);

    const data = await request.json();

    const existing = submissions.get('address') ?? [];
    submissions.set('address', [...existing, { formId: 'address', data }]);

    return HttpResponse.json({
      success: true,
      id: crypto.randomUUID(),
      message: 'Address saved successfully',
    });
  }),

  // Preferences Form endpoint
  http.post('/api/forms/preferences', async ({ request }) => {
    await delay(400);

    const data = await request.json();

    const existing = submissions.get('preferences') ?? [];
    submissions.set('preferences', [...existing, { formId: 'preferences', data }]);

    return HttpResponse.json({
      success: true,
      id: crypto.randomUUID(),
      message: 'Preferences saved successfully',
    });
  }),

  // Endpoint that simulates failure (for testing)
  http.post('/api/forms/failing', async () => {
    await delay(300);

    return HttpResponse.json({ success: false, error: 'Simulated server error' }, { status: 500 });
  }),
];
