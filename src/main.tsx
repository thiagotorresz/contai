import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { LoginPage } from './LoginPage';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<App />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);