import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Save } from 'lucide-react';

function AdminForms({ onAddQuestion, onImportCsv, adminPassword, setAdminPassword }) {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    module_name: '',
    type: 'revision',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    answer_text: '',
    difficulty: 'medium'
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setQuestionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    
    if (!adminPassword) {
      alert('Please enter admin password first');
      return;
    }

    setLoading(true);
    try {
      await onAddQuestion(questionForm);
      setQuestionForm({
        module_name: '',
        type: 'revision',
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        answer_text: '',
        difficulty: 'medium'
      });
      setIsAddingQuestion(false);
    } catch (error) {
      console.error('Error adding question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCsvImport = async () => {
    if (!adminPassword) {
      alert('Please enter admin password first');
      return;
    }
    
    setLoading(true);
    try {
      await onImportCsv();
    } catch (error) {
      console.error('Error importing CSV:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Password Input */}
      <motion.div
        className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="font-heading text-lg font-semibold text-yellow-800 mb-4">
          🔐 Admin Authentication
        </h3>
        <div className="flex space-x-4">
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Enter admin password..."
            className="flex-1 px-4 py-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-body"
          />
          <div className="text-yellow-600">
            {adminPassword ? '✓ Password set' : '⚠ Password required'}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="bg-white rounded-3xl shadow-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h3 className="font-heading text-xl font-bold text-gray-800 mb-6">
          ⚡ Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setIsAddingQuestion(!isAddingQuestion)}
            disabled={!adminPassword}
            className="flex items-center justify-center space-x-3 bg-primary-green text-white font-body font-semibold py-4 px-6 rounded-2xl hover:bg-accent-green disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-glow-green"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Question</span>
          </button>
          
          <button
            onClick={handleCsvImport}
            disabled={!adminPassword || loading}
            className="flex items-center justify-center space-x-3 bg-primary-orange text-white font-body font-semibold py-4 px-6 rounded-2xl hover:bg-accent-orange disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-glow-orange"
          >
            <Upload className="w-5 h-5" />
            <span>Import from CSV</span>
          </button>
        </div>
      </motion.div>

      {/* Add Question Form */}
      {isAddingQuestion && (
        <motion.div
          className="bg-white rounded-3xl shadow-card p-6 border-l-4 border-primary-green"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-heading text-xl font-bold text-gray-800 mb-6">
            📝 Add New Question
          </h3>
          
          <form onSubmit={handleSubmitQuestion} className="space-y-6">
            {/* Module and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-body font-medium text-gray-700 mb-2">
                  Module Name
                </label>
                <input
                  type="text"
                  value={questionForm.module_name}
                  onChange={(e) => handleInputChange('module_name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent font-body"
                  placeholder="e.g., Trigonometry"
                  required
                />
              </div>
              
              <div>
                <label className="block font-body font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  value={questionForm.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent font-body"
                  required
                >
                  <option value="revision">Revision</option>
                  <option value="mock">Mock Test</option>
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block font-body font-medium text-gray-700 mb-2">
                Question Text
              </label>
              <textarea
                value={questionForm.question_text}
                onChange={(e) => handleInputChange('question_text', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent font-body"
                rows="3"
                placeholder="Enter the question..."
                required
              />
            </div>

            {/* Options (for mock questions) */}
            {questionForm.type === 'mock' && (
              <div className="space-y-4">
                <h4 className="font-body font-semibold text-gray-700">Answer Options</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map(option => (
                    <div key={option}>
                      <label className="block font-body font-medium text-gray-700 mb-2">
                        Option {option}
                      </label>
                      <input
                        type="text"
                        value={questionForm[`option_${option.toLowerCase()}`]}
                        onChange={(e) => handleInputChange(`option_${option.toLowerCase()}`, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent font-body"
                        placeholder={`Option ${option}...`}
                        required
                      />
                    </div>
                  ))}
                </div>
                
                <div>
                  <label className="block font-body font-medium text-gray-700 mb-2">
                    Correct Option
                  </label>
                  <select
                    value={questionForm.correct_option}
                    onChange={(e) => handleInputChange('correct_option', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent font-body"
                    required
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
            )}

            {/* Answer Text */}
            <div>
              <label className="block font-body font-medium text-gray-700 mb-2">
                Answer/Explanation
              </label>
              <textarea
                value={questionForm.answer_text}
                onChange={(e) => handleInputChange('answer_text', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent font-body"
                rows="3"
                placeholder="Provide the answer or explanation..."
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block font-body font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={questionForm.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:border-transparent font-body"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsAddingQuestion(false)}
                className="bg-gray-600 text-white font-body font-semibold py-3 px-6 rounded-xl hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-green text-white font-body font-semibold py-3 px-6 rounded-xl hover:bg-accent-green disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 btn-glow-green"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Add Question</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}

export default AdminForms;
