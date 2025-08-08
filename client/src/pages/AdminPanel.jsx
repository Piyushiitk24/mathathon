import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Users, FileText, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AdminForms from '../components/AdminForms';
import { adminAPI, formatDisplayTime } from '../api/api';

function AdminPanel() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [adminPassword, setAdminPassword] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Wrap loaders to satisfy exhaustive-deps
  const loadAttempts = useCallback(async () => {
    if (!adminPassword) return;
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getAttempts(adminPassword);
      setAttempts(response.data);
    } catch (error) {
      console.error('Error loading attempts:', error);
      setError(error.response?.data?.error || 'Failed to load attempts');
    } finally {
      setLoading(false);
    }
  }, [adminPassword]);

  const loadStats = useCallback(async () => {
    if (!adminPassword) return;
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getStats(adminPassword);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
      setError(error.response?.data?.error || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [adminPassword]);

  useEffect(() => {
    if (adminPassword && activeTab === 'attempts') {
      loadAttempts();
    }
    if (adminPassword && activeTab === 'overview') {
      loadStats();
    }
  }, [adminPassword, activeTab, loadAttempts, loadStats]);

  const handleAddQuestion = async (questionData) => {
    try {
      await adminAPI.addQuestion(questionData, adminPassword);
      alert('Question added successfully!');
      if (activeTab === 'overview') {
        loadStats();
      }
    } catch (error) {
      console.error('Error adding question:', error);
      alert(error.response?.data?.error || 'Failed to add question');
      throw error;
    }
  };

  const handleImportCsv = async () => {
    try {
      const response = await adminAPI.importCsv(adminPassword);
      alert(response.data.message || 'CSV import completed');
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert(error.response?.data?.error || 'Failed to import CSV');
      throw error;
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'manage', label: 'Manage Content', icon: FileText },
    { id: 'attempts', label: 'User Attempts', icon: Users }
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-text-subtle hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body">Back to Dashboard</span>
          </button>
          
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold text-gray-800">
              ⚙️ Admin Panel
            </h1>
            <p className="font-body text-text-subtle">
              Manage content and monitor user activity
            </p>
          </div>
          
          <div className="w-20"></div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="bg-white rounded-2xl shadow-card p-2 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="flex space-x-2">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-6 py-3 rounded-xl font-body font-medium transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-primary-green text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Password required message */}
              {!adminPassword && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
                  <h3 className="font-heading text-lg font-semibold text-yellow-800 mb-2">
                    🔐 Authentication Required
                  </h3>
                  <p className="font-body text-yellow-700">
                    Please enter your admin password in the Manage Content tab to view statistics.
                  </p>
                </div>
              )}

              {/* Stats Overview */}
              {stats && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl shadow-card p-6 text-center">
                      <div className="text-3xl font-heading font-bold text-primary-green mb-2">
                        {stats.overview.total_modules}
                      </div>
                      <p className="font-body text-text-subtle">Modules</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-card p-6 text-center">
                      <div className="text-3xl font-heading font-bold text-primary-orange mb-2">
                        {stats.overview.total_questions}
                      </div>
                      <p className="font-body text-text-subtle">Questions</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-card p-6 text-center">
                      <div className="text-3xl font-heading font-bold text-blue-600 mb-2">
                        {stats.overview.total_attempts}
                      </div>
                      <p className="font-body text-text-subtle">Total Attempts</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-card p-6 text-center">
                      <div className="text-3xl font-heading font-bold text-purple-600 mb-2">
                        {stats.overview.unique_users}
                      </div>
                      <p className="font-body text-text-subtle">Active Users</p>
                    </div>
                  </div>

                  {/* Module Stats */}
                  <div className="bg-white rounded-3xl shadow-card p-6">
                    <h3 className="font-heading text-xl font-bold text-gray-800 mb-6">
                      📊 Module Performance
                    </h3>
                    
                    <div className="space-y-4">
                      {stats.module_stats.map((module, index) => (
                        <motion.div
                          key={module.module_name}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <div className="flex-1">
                            <h4 className="font-body font-semibold text-gray-800">
                              {module.module_name}
                            </h4>
                            <p className="font-body text-text-subtle text-sm">
                              {module.attempts} total attempts • {module.mock_attempts} mock tests
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-heading text-lg font-bold text-primary-green">
                              {module.average_score.toFixed(1)}%
                            </div>
                            <p className="font-body text-text-subtle text-sm">Avg Score</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manage' && (
            <AdminForms
              onAddQuestion={handleAddQuestion}
              onImportCsv={handleImportCsv}
              adminPassword={adminPassword}
              setAdminPassword={setAdminPassword}
            />
          )}

          {activeTab === 'attempts' && (
            <div className="space-y-6">
              {/* Password required message */}
              {!adminPassword && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
                  <h3 className="font-heading text-lg font-semibold text-yellow-800 mb-2">
                    🔐 Authentication Required
                  </h3>
                  <p className="font-body text-yellow-700">
                    Please enter your admin password in the Manage Content tab to view user attempts.
                  </p>
                </div>
              )}

              {/* Attempts List */}
              {adminPassword && (
                <div className="bg-white rounded-3xl shadow-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-heading text-xl font-bold text-gray-800">
                      👥 Recent User Attempts
                    </h3>
                    <button
                      onClick={loadAttempts}
                      disabled={loading}
                      className="bg-primary-green text-white font-body font-semibold py-2 px-4 rounded-lg hover:bg-accent-green disabled:opacity-50 transition-colors duration-200"
                    >
                      {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>

                  {loading && (
                    <div className="text-center py-8">
                      <div className="loading-spinner w-8 h-8 border-4 border-primary-green border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="font-body text-text-subtle">Loading attempts...</p>
                    </div>
                  )}

                  {error && (
                    <div className="text-center py-8">
                      <p className="font-body text-red-600">{error}</p>
                    </div>
                  )}

                  {!loading && !error && attempts.length === 0 && (
                    <div className="text-center py-8">
                      <p className="font-body text-text-subtle">No attempts found.</p>
                    </div>
                  )}

                  {!loading && !error && attempts.length > 0 && (
                    <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                      {attempts.map((attempt, index) => (
                        <motion.div
                          key={attempt.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <span className="font-body font-semibold text-gray-800">
                                {attempt.username}
                              </span>
                              <span className={`
                                px-2 py-1 rounded-full text-xs font-body font-medium
                                ${attempt.type === 'mock' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}
                              `}>
                                {attempt.type}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm font-body text-text-subtle">
                              <span className="flex items-center space-x-1">
                                <FileText className="w-4 h-4" />
                                <span>{attempt.module_name}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDisplayTime(attempt.username, attempt.datetime_iso)}</span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {attempt.type === 'mock' && (
                              <div className="flex items-center space-x-4">
                                <div>
                                  <div className="font-heading text-lg font-bold text-primary-green">
                                    {attempt.score || 0}
                                  </div>
                                  <p className="font-body text-text-subtle text-xs">Score</p>
                                </div>
                                <div>
                                  <div className="font-body text-sm text-gray-600 flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{Math.floor((attempt.time_taken_seconds || 0) / 60)}m</span>
                                  </div>
                                  <p className="font-body text-text-subtle text-xs">Time</p>
                                </div>
                              </div>
                            )}
                            {attempt.type === 'revision' && (
                              <div>
                                <div className="font-body text-sm text-gray-600">
                                  📚 Studied
                                </div>
                                <p className="font-body text-text-subtle text-xs">
                                  {JSON.parse(attempt.details).flashed_questions?.length || 0} questions
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default AdminPanel;
