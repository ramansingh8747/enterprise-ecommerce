import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import { AppProviders } from '@/providers';
import '@/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root HTML element with id "root".');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
