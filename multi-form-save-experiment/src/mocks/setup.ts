export async function setupMocks() {
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('./browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
      });
      console.log('[MSW] Mock Service Worker started');
    } catch (error) {
      console.warn('[MSW] Failed to start Mock Service Worker:', error);
    }
  }
}
