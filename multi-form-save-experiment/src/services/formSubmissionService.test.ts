import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { submitForm } from './formSubmissionService';

describe('formSubmissionService', () => {
  describe('submitForm', () => {
    it('returns success result for valid userInfo submission', async () => {
      const result = await submitForm('userInfo', { name: 'John', email: 'john@example.com' });

      expect(result.success).toBe(true);
      expect(result.formId).toBe('userInfo');
      expect(result.data).toBeDefined();
    });

    it('returns success result for valid address submission', async () => {
      const result = await submitForm('address', {
        street: '123 Main St',
        city: 'Anytown',
      });

      expect(result.success).toBe(true);
      expect(result.formId).toBe('address');
    });

    it('returns success result for valid preferences submission', async () => {
      const result = await submitForm('preferences', {
        newsletter: true,
        theme: 'dark',
      });

      expect(result.success).toBe(true);
      expect(result.formId).toBe('preferences');
    });

    it('returns error result for unknown form ID', async () => {
      const result = await submitForm('unknownForm', { data: 'test' });

      expect(result.success).toBe(false);
      expect(result.formId).toBe('unknownForm');
      expect(result.error).toContain('Unknown form ID');
    });

    it('returns error result when server returns error status', async () => {
      // Override the handler to return an error
      server.use(
        http.post('/api/forms/user-info', () => {
          return HttpResponse.json({ success: false, error: 'Server error' }, { status: 500 });
        })
      );

      const result = await submitForm('userInfo', { name: 'John' });

      expect(result.success).toBe(false);
      expect(result.formId).toBe('userInfo');
      expect(result.error).toBeDefined();
    });

    it('returns error result when server returns success: false', async () => {
      server.use(
        http.post('/api/forms/user-info', () => {
          return HttpResponse.json({ success: false, error: 'Validation failed' });
        })
      );

      const result = await submitForm('userInfo', { name: 'John' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
    });

    it('handles network errors gracefully', async () => {
      server.use(
        http.post('/api/forms/user-info', () => {
          return HttpResponse.error();
        })
      );

      const result = await submitForm('userInfo', { name: 'John' });

      expect(result.success).toBe(false);
      expect(result.formId).toBe('userInfo');
      expect(result.error).toBeDefined();
    });
  });
});
