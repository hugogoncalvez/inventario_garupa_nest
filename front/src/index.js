import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <>
    <InitColorSchemeScript />
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </>
);


