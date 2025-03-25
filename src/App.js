// src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './router/Routes';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { NotificationProvider } from './context/NotificationContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <NotificationProvider>
          <Router>
            <AppRoutes />
          </Router>
        </NotificationProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;