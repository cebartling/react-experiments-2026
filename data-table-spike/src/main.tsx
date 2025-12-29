import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import App from './App.tsx';
import './styles/tailwind.css';
import './index.css';

async function enableMocking() {
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('./mocks/browser');
      return worker.start({
        onUnhandledRequest: 'bypass',
      });
    } catch (error) {
      console.error('Failed to enable API mocking:', error);
    }
  }
}

enableMocking()
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <BrowserRouter>
          <QueryProvider>
            <App />
          </QueryProvider>
        </BrowserRouter>
      </StrictMode>
    );
  })
  .catch((error) => {
    console.error('Application initialization failed during mocking setup:', error);
  });
