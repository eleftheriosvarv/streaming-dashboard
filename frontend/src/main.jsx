import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './Dashboard.jsx';
import './index.css'; // 👈 ΠΡΟΣΘΗΚΗ για Tailwind!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);


