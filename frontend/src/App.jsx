import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginSignup from './pages/LoginSignup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import BatchAnalyzer from './pages/BatchAnalyzer';
import UserProfile from './pages/UserProfile';
import APIKeys from './pages/APIKeys';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    setIsAuthenticated(!!token);
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.role || 'user');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} /> : <LoginSignup />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated && userRole !== 'admin' ? <Dashboard /> : isAuthenticated ? <Navigate to="/admin" /> : <Navigate to="/login" />}
        />
        <Route
          path="/batch"
          element={isAuthenticated && userRole !== 'admin' ? <BatchAnalyzer /> : isAuthenticated ? <Navigate to="/admin" /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated && userRole !== 'admin' ? <UserProfile /> : isAuthenticated ? <Navigate to="/admin" /> : <Navigate to="/login" />}
        />
        <Route
          path="/keys"
          element={isAuthenticated && userRole !== 'admin' ? <APIKeys /> : isAuthenticated ? <Navigate to="/admin" /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={isAuthenticated && userRole === 'admin' ? <AdminDashboard /> : isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? (userRole === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
