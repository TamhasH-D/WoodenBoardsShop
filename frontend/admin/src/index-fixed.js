import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles-fixed.css';
import TestApp from './TestApp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
