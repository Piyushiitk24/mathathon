import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight } from 'lucide-react';
import { authAPI } from '../api/api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter your codename');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(username.trim());
      if (response.data.ok) {
        onLogin(response.data.username);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo and Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-primary-green w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-green">
            <Calculator className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-gray-800 mb-2">
            Mathathon
          </h1>
          <p className="font-body text-text-subtle text-lg">
            Interactive Mathematics Learning Platform
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="bg-white rounded-3xl shadow-card p-8 border-l-4 border-primary-green"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="text-center mb-6">
            <h2 className="font-heading text-2xl font-bold text-gray-800 mb-2">
              Enter Mission Control
            </h2>
            <p className="font-body text-text-subtle">
              Your learning journey starts here
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="username" 
                className="block font-body font-medium text-gray-700 mb-2"
              >
                Enter your codename
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent font-body transition-all duration-200"
                placeholder="Your unique identifier..."
                disabled={loading}
                autoComplete="username"
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                className="text-error text-sm font-body bg-red-50 p-3 rounded-lg border border-red-200"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full bg-primary-green text-white font-body font-semibold py-3 px-6 rounded-xl hover:bg-accent-green disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 btn-glow-green"
            >
              {loading ? (
                <>
                  <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Accessing...</span>
                </>
              ) : (
                <>
                  <span>Start Learning</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center font-body text-sm text-text-subtle">
              New here? Just enter any name to create your profile.
            </p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="mt-8 grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl p-4 shadow-card text-center">
            <div className="text-2xl mb-2">📚</div>
            <p className="font-body text-sm text-text-subtle">Study Mode</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-card text-center">
            <div className="text-2xl mb-2">🎯</div>
            <p className="font-body text-sm text-text-subtle">Mock Tests</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
