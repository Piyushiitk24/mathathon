import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/bg-pattern.css';
import 'tailwindcss/tailwind.css';
import { MathJaxContext } from 'better-react-mathjax';

const mathJaxConfig = {
  tex: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)']
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]']
    ],
    processEscapes: true,
    packages: { '[+]': ['noerrors', 'noundefined'] }
  },
  options: { renderActions: { addMenu: [] } }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MathJaxContext config={mathJaxConfig} version={3}>
      <App />
    </MathJaxContext>
  </React.StrictMode>
);
