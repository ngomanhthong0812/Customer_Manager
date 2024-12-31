import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import "nprogress/nprogress.css";
import AppRoutes from './router';
import { AuthProvider } from './contexts/AuthProvider';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
