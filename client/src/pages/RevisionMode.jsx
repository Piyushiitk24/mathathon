import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

import QuestionCard from '../components/QuestionCard';
import TimerHourglass from '../components/TimerHourglass';
import { questionsAPI, attemptsAPI, modulesAPI } from '../api/api';

const QUESTION_DURATION = 25; // seconds per question

function RevisionMode({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [module, setModule] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [flashedQuestions, setFlashedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [moduleResponse, questionsResponse] = await Promise.all([
        modulesAPI.getById(id),
        questionsAPI.getByModuleAndType(id, 'revision')
      ]);
      setModule(moduleResponse.data);
      const shuffled = shuffle(questionsResponse.data || []);
      setQuestions(shuffled);
      if ((questionsResponse.data || []).length === 0) {
        setError('No revision questions found for this module.');
      }
    } catch (error) {
      console.error('Error loading revision data:', error);
      setError('Failed to load revision content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTimerComplete = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishRevision();
    }
  };

  const finishRevision = async () => {
    setIsPlaying(false);
    setIsFinished(true);
    try {
      const flashedData = questions.map(q => ({ id: q.id, question_text: q.question_text, answer_text: q.answer_text }));
      setFlashedQuestions(flashedData);
      const attemptData = {
        username: user.username,
        module_id: parseInt(id),
        type: 'revision',
        datetime_iso: new Date().toISOString(),
        details: { flashed_questions: flashedData }
      };
      await attemptsAPI.create(attemptData);
    } catch (error) {
      console.error('Error recording revision attempt:', error);
    }
  };

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentIndex(0);
    setIsFinished(false);
    setFlashedQuestions([]);
  };

  const handlePause = () => setIsPlaying(false);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setIsFinished(false);
    setFlashedQuestions([]);
  };

  const handleBack = () => navigate('/');

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-grid bg-dots">
        <motion.div className="text-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="loading-spinner w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="font-heading text-2xl text-charcoal uppercase tracking-widest">Loading revision content...</h2>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-grid bg-dots">
        <motion.div className="text-center max-w-md alert alert--error" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="bg-error w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border-4 border-charcoal">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="font-heading text-2xl text-charcoal mb-2 uppercase tracking-widest">Oops!</h2>
          <p className="font-body text-text-subtle mb-6">{error}</p>
          <div className="space-x-4">
            <button onClick={loadData} className="btn-retro">Try Again</button>
            <button onClick={handleBack} className="btn-retro btn-retro--orange">Go Back</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-grid bg-dots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="flex items-center justify-between mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button onClick={handleBack} className="flex items-center space-x-2 text-charcoal hover:text-deep-green-700 transition-colors duration-200">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-mono uppercase tracking-widest">Back to Modules</span>
          </button>
          <div className="text-center">
            <h1 className="font-heading text-3xl font-extrabold text-charcoal uppercase tracking-widest">📚 {module?.name} - Study Mode</h1>
            <p className="font-body text-text-subtle">Flash card revision • {questions.length} questions</p>
          </div>
          <div className="w-20"></div>
        </motion.div>

        {!isPlaying && !isFinished && (
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="panel p-8 mb-8">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="font-heading text-2xl font-bold text-charcoal mb-4 uppercase tracking-widest">
                Ready to Start Revision?
              </h2>
              <p className="font-body text-text-subtle mb-6 leading-relaxed">
                You'll see {questions.length} questions, each displayed for {QUESTION_DURATION} seconds. 
                Focus on understanding and memorizing the concepts. After all questions, 
                you'll see a complete review with answers.
              </p>
              
              <div className="flex justify-center space-x-4">
                <button onClick={handleStart} className="btn-retro flex items-center space-x-3">
                  <Play className="w-5 h-5 text-charcoal" />
                  <span>Start Revision</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {isPlaying && (
          <div className="space-y-8">
            <motion.div
              className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-4">
                <span className="font-mono text-text-subtle uppercase tracking-widest">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="w-48 bg-charcoal rounded-full h-2">
                  <motion.div
                    className="bg-neon-green h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              
              <TimerHourglass
                totalSeconds={QUESTION_DURATION}
                onComplete={handleTimerComplete}
                isActive={isPlaying}
                key={currentIndex}
              />
              
              <div className="flex items-center space-x-2">
                <button onClick={handlePause} className="btn-retro btn-retro--orange p-3">
                  <Pause className="w-5 h-5 text-charcoal" />
                </button>
                <button onClick={handleReset} className="btn-retro p-3">
                  <RotateCcw className="w-5 h-5 text-charcoal" />
                </button>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {questions[currentIndex] && (
                <QuestionCard
                  key={currentIndex}
                  question={questions[currentIndex]}
                  isVisible={true}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {isFinished && (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center panel p-8 celebration">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="font-heading text-3xl font-bold text-charcoal mb-4 uppercase tracking-widest">
                Revision Complete!
              </h2>
              <p className="font-body text-text-subtle mb-6">
                Great job! You've reviewed all {questions.length} questions. 
                Here's a complete summary with answers.
              </p>
              
              <div className="flex justify-center space-x-4">
                <button onClick={handleStart} className="btn-retro">Review Again</button>
                <button onClick={handleBack} className="btn-retro btn-retro--orange">Back to Modules</button>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-heading text-2xl font-bold text-charcoal text-center uppercase tracking-widest">
                📖 Complete Review
              </h3>
              
              {flashedQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  className="panel p-6 border-neon-green"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-charcoal text-neon-green w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-sm flex-shrink-0 border-2 border-neon-green">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="math-expression font-body text-lg text-charcoal mb-3">
                        <strong>Q:</strong> {question.question_text}
                      </div>
                      {question.answer_text && (
                        <div className="math-expression font-body text-lg text-charcoal bg-paper p-3 rounded-lg border-2 border-neon-green">
                          <strong>A:</strong> {question.answer_text}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default RevisionMode;
