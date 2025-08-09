import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';

// Import pages
import Login from './pages/Login';
import ModulesList from './pages/ModulesList';
import RevisionMode from './pages/RevisionMode';
import MockTestMode from './pages/MockTestMode';
import AdminPanel from './pages/AdminPanel';

// Import components
import Header from './components/Header';

// Import API
import { authAPI } from './api/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await authAPI.getSession();
      if (response.data.username) {
        setUser({ username: response.data.username });
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (username) => {
    setUser({ username });
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API call fails, clear local state
      setUser(null);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main bg-pattern flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="loading-spinner w-12 h-12 border-4 border-primary-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="font-heading text-2xl text-gray-700">Loading Mathathon...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-bg-main bg-pattern">
        <AnimatePresence mode="wait">
          {user && (
            <Header user={user} onLogout={handleLogout} />
          )}
          
          <Routes>
            <Route 
              path="/login" 
              element={
                user ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } 
            />
            
            <Route 
              path="/" 
              element={
                user ? (
                  <ModulesList user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            <Route 
              path="/module/:id/revision" 
              element={
                user ? (
                  <RevisionMode user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            <Route 
              path="/module/:id/mock" 
              element={
                user ? (
                  <MockTestMode user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            <Route 
              path="/admin" 
              element={<AdminPanel />} 
            />
            
            {/* Catch all route - redirect to home or login */}
            <Route 
              path="*" 
              element={
                <Navigate to={user ? "/" : "/login"} replace />
              } 
            />
          </Routes>
        </AnimatePresence>
        
        {/* Vercel Analytics */}
        <Analytics />
      </div>
    </Router>
  );
}

export default App;
