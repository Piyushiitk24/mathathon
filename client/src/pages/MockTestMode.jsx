import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowLeft as PrevIcon, CheckCircle, Clock, Target } from 'lucide-react';

import AnswerList from '../components/AnswerList';
import ProgressDots from '../components/ProgressDots';
import { questionsAPI, attemptsAPI, modulesAPI, calculateScore, formatDuration } from '../api/api';

function MockTestMode({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [module, setModule] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStarted, setIsStarted] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [moduleResponse, questionsResponse] = await Promise.all([
        modulesAPI.getById(id),
        questionsAPI.getByModuleAndType(id, 'mock')
      ]);
      setModule(moduleResponse.data);
      setQuestions(questionsResponse.data);
      if (questionsResponse.data.length === 0) {
        setError('No mock test questions found for this module.');
      }
    } catch (error) {
      console.error('Error loading mock test data:', error);
      setError('Failed to load mock test content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStart = () => {
    setIsStarted(true);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setAnswers([]);
    setIsFinished(false);
    setResults(null);
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.qId === questionId);
      if (existing) {
        return prev.map(a => (a.qId === questionId ? { ...a, chosen: selectedOption } : a));
      }
      return [...prev, { qId: questionId, chosen: selectedOption }];
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const endTime = Date.now();
    const timeTakenSeconds = Math.floor((endTime - startTime) / 1000);
    const score = calculateScore(answers, questions);
    const resultsData = {
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      timeTaken: timeTakenSeconds,
      answers
    };
    setResults(resultsData);
    setIsFinished(true);
    try {
      const attemptData = {
        username: user.username,
        module_id: parseInt(id),
        type: 'mock',
        datetime_iso: new Date().toISOString(),
        score,
        time_taken_seconds: timeTakenSeconds,
        details: { answers }
      };
      await attemptsAPI.create(attemptData);
      console.log('Mock test attempt recorded successfully');
    } catch (error) {
      console.error('Error recording mock test attempt:', error);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleRestart = () => {
    setIsStarted(false);
    setIsFinished(false);
    setResults(null);
    setAnswers([]);
    setCurrentIndex(0);
    setStartTime(null);
  };

  const getCelebrationMessage = (percentage) => {
    if (percentage >= 90) return { emoji: '🏆', message: "Outstanding! You're a math champion!" };
    if (percentage >= 80) return { emoji: '🎉', message: 'Excellent work! Keep it up!' };
    if (percentage >= 70) return { emoji: '👏', message: "Great job! You're doing well!" };
    if (percentage >= 60) return { emoji: '👍', message: 'Good effort! Keep practicing!' };
    return { emoji: '💪', message: "Keep learning! You'll get there!" };
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div className="text-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="loading-spinner w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="font-heading text-2xl text-gray-700">Loading mock test...</h2>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <motion.div className="text-center max-w-md" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="bg-red-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="font-heading text-2xl text-gray-800 mb-2">Oops!</h2>
          <p className="font-body text-text-subtle mb-6">{error}</p>
          <div className="space-x-4">
            <button onClick={loadData} className="bg-primary-orange text-white font-body font-semibold py-3 px-6 rounded-xl hover:bg-accent-orange transition-colors duration-200 btn-glow-orange">Try Again</button>
            <button onClick={handleBack} className="bg-gray-600 text-white font-body font-semibold py-3 px-6 rounded-xl hover:bg-gray-700 transition-colors duration-200">Go Back</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.find(a => a.qId === currentQuestion?.id)?.chosen;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="flex items-center justify-between mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button onClick={handleBack} className="flex items-center space-x-2 text-text-subtle hover:text-gray-800 transition-colors duration-200">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body">Back to Modules</span>
          </button>
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold text-gray-800">🎯 {module?.name} - Mock Test</h1>
            <p className="font-body text-text-subtle">Test your knowledge • {questions.length} questions</p>
          </div>
          <div className="w-20"></div>
        </motion.div>

        {!isStarted && !isFinished && (
          /* Start Screen */
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-3xl shadow-card p-8 mb-8">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="font-heading text-2xl font-bold text-gray-800 mb-4">
                Ready for the Mock Test?
              </h2>
              <p className="font-body text-text-subtle mb-6 leading-relaxed">
                You'll answer {questions.length} multiple-choice questions. Take your time - there's no time limit. 
                You can navigate between questions and change your answers before submitting.
              </p>
              
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
                <h3 className="font-body font-semibold text-orange-800 mb-2">Test Instructions:</h3>
                <ul className="font-body text-orange-700 text-sm space-y-1 text-left">
                  <li>• Select one answer for each question</li>
                  <li>• Use the dots to navigate between questions</li>
                  <li>• Review your answers before submitting</li>
                  <li>• Your time will be tracked automatically</li>
                </ul>
              </div>
              
              <button
                onClick={handleStart}
                className="bg-primary-orange text-white font-body font-semibold py-4 px-8 rounded-2xl hover:bg-accent-orange transition-all duration-200 flex items-center space-x-3 mx-auto btn-glow-orange"
              >
                <Target className="w-5 h-5" />
                <span>Start Mock Test</span>
              </button>
            </div>
          </motion.div>
        )}

        {isStarted && !isFinished && (
          /* Active Test */
          <div className="space-y-8">
            {/* Progress and Navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Progress Dots */}
              <div className="lg:col-span-3">
                <ProgressDots
                  questions={questions}
                  currentIndex={currentIndex}
                  answers={answers}
                />
              </div>
            </div>

            {/* Current Question */}
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentIndex}
                  className="space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Question */}
                  <div className="bg-white rounded-3xl shadow-card p-8 border-l-4 border-primary-orange">
                    <div className="flex items-start justify-between mb-6">
                      <h3 className="font-heading text-lg font-semibold text-gray-800">
                        Question {currentIndex + 1} of {questions.length}
                      </h3>
                      {currentQuestion.difficulty && (
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-body font-medium
                          ${currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'}
                        `}>
                          {currentQuestion.difficulty}
                        </span>
                      )}
                    </div>
                    
                    <div className="math-expression font-body text-xl text-gray-800 mb-8 leading-relaxed">
                      {currentQuestion.question_text}
                    </div>
                    
                    <AnswerList
                      question={currentQuestion}
                      selectedAnswer={currentAnswer}
                      onAnswerSelect={(option) => handleAnswerSelect(currentQuestion.id, option)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center space-x-2 bg-gray-600 text-white py-3 px-6 rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <PrevIcon className="w-5 h-5" />
                <span className="font-body font-medium">Previous</span>
              </button>

              <div className="flex items-center space-x-4">
                <span className="font-body text-text-subtle">
                  {answers.length} of {questions.length} answered
                </span>
                
                {answers.length === questions.length && (
                  <button
                    onClick={handleSubmit}
                    className="bg-success text-white font-body font-semibold py-3 px-6 rounded-xl hover:bg-green-600 transition-all duration-200 flex items-center space-x-2 btn-glow-green celebration"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Submit Test</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="flex items-center space-x-2 bg-primary-orange text-white py-3 px-6 rounded-xl hover:bg-accent-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 btn-glow-orange"
              >
                <span className="font-body font-medium">Next</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {isFinished && results && (
          /* Results Screen */
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Results Summary */}
            <div className="text-center bg-white rounded-3xl shadow-card p-8 celebration">
              <div className="text-6xl mb-4">
                {getCelebrationMessage(results.percentage).emoji}
              </div>
              <h2 className="font-heading text-3xl font-bold text-gray-800 mb-2">
                Test Complete!
              </h2>
              <p className="font-body text-text-subtle mb-6">
                {getCelebrationMessage(results.percentage).message}
              </p>

              {/* Score Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-primary-green bg-opacity-10 rounded-2xl p-6">
                  <div className="text-3xl font-heading font-bold text-primary-green mb-2">
                    {results.score}/{results.total}
                  </div>
                  <p className="font-body text-text-subtle">Correct Answers</p>
                </div>
                
                <div className="bg-primary-orange bg-opacity-10 rounded-2xl p-6">
                  <div className="text-3xl font-heading font-bold text-primary-orange mb-2">
                    {results.percentage}%
                  </div>
                  <p className="font-body text-text-subtle">Score</p>
                </div>
                
                <div className="bg-blue-100 rounded-2xl p-6">
                  <div className="text-3xl font-heading font-bold text-blue-600 mb-2 flex items-center justify-center space-x-2">
                    <Clock className="w-6 h-6" />
                    <span>{formatDuration(results.timeTaken)}</span>
                  </div>
                  <p className="font-body text-text-subtle">Time Taken</p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleRestart}
                  className="bg-primary-orange text-white font-body font-semibold py-3 px-6 rounded-xl hover:bg-accent-orange transition-colors duration-200 btn-glow-orange"
                >
                  Retake Test
                </button>
                <button
                  onClick={handleBack}
                  className="bg-gray-600 text-white font-body font-semibold py-3 px-6 rounded-xl hover:bg-gray-700 transition-colors duration-200"
                >
                  Back to Modules
                </button>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-6">
              <h3 className="font-heading text-2xl font-bold text-gray-800 text-center">
                📊 Detailed Results
              </h3>
              
              {questions.map((question, index) => {
                const userAnswer = answers.find(a => a.qId === question.id);
                const isCorrect = userAnswer?.chosen === question.correct_option;
                
                return (
                  <motion.div
                    key={question.id}
                    className="bg-white rounded-3xl shadow-card p-6 border-l-4 border-gray-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-sm flex-shrink-0
                        ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      `}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <div className="math-expression font-body text-lg text-gray-800 mb-4">
                          <strong>Q{index + 1}:</strong> {question.question_text}
                        </div>
                        
                        <AnswerList
                          question={question}
                          selectedAnswer={userAnswer?.chosen}
                          showCorrect={true}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default MockTestMode;
