import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';
import ModuleCard from '../components/ModuleCard';
import { modulesAPI } from '../api/api';

function ModulesList({ user }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await modulesAPI.getAll();
      setModules(response.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setError('Failed to load modules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchModules();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Loader2 className="w-12 h-12 text-primary-green animate-spin mx-auto mb-4" />
          <h2 className="font-heading text-2xl text-gray-700">Loading modules...</h2>
          <p className="font-body text-text-subtle mt-2">Preparing your learning experience</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-red-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="font-heading text-2xl text-gray-800 mb-2">Oops!</h2>
          <p className="font-body text-text-subtle mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-primary-green text-white font-body font-semibold py-3 px-6 rounded-xl hover:bg-accent-green transition-colors duration-200 btn-glow-green"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-grid bg-dots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-heading text-4xl font-bold text-gray-800 mb-4">
            Welcome back, {user.username}! 👋
          </h1>
          <p className="font-body text-xl text-text-subtle max-w-2xl mx-auto">
            Choose a learning module to continue your mathematical journey. 
            Each module offers study mode for learning and mock tests for practice.
          </p>
        </motion.div>

        {/* Select Module Section */}
        <motion.div
          className="text-center max-w-md mx-auto mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center space-x-2 mb-2">
            <span className="led led-green" />
            <span className="font-mono text-xs text-charcoal bg-neon-green px-2 py-1 rounded shadow-bezel">SCHEMATIC</span>
          </div>
          <h2 className="font-heading text-3xl text-charcoal uppercase tracking-widest">Select Module</h2>
          <p className="font-body text-text-subtle mb-2">Each module offers study mode for learning and mock tests.</p>
        </motion.div>

        {/* Modules Grid */}
        {modules.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {modules.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gray-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📚</span>
            </div>
            <h3 className="font-heading text-2xl text-gray-800 mb-4">
              No modules available yet
            </h3>
            <p className="font-body text-text-subtle mb-6 max-w-md mx-auto">
              It looks like no learning modules have been set up yet. 
              Contact your administrator to add some content.
            </p>
            <button
              onClick={handleRetry}
              className="bg-primary-green text-white font-body font-semibold py-3 px-6 rounded-xl hover:bg-accent-green transition-colors duration-200 btn-glow-green"
            >
              Refresh
            </button>
          </motion.div>
        )}

        {/* Learning Tips */}
        {modules.length > 0 && (
          <motion.div
            className="mt-16 bg-white rounded-3xl shadow-card p-8 border-l-4 border-primary-orange"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h3 className="font-heading text-2xl font-bold text-gray-800 mb-4">
              💡 Learning Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-body text-text-subtle">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">📚 Study Mode</h4>
                <p>Review concepts with timed flash cards. Each question appears for 25 seconds to help you build quick recall.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">🎯 Mock Test</h4>
                <p>Test your knowledge with interactive quizzes. Track your progress and identify areas for improvement.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ModulesList;
