import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tailwind.css';
import './index.css';
import App from './App.tsx';
import { setupMocks } from './mocks/setup';

async function bootstrap() {
  await setupMocks();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
