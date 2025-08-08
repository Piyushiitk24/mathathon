import React from 'react';
import { motion } from 'framer-motion';
import MathText from './MathText';

function QuestionCard({ question, isVisible = true, showAnswer = false }) {
  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        y: isVisible ? 0 : 20,
        scale: isVisible ? 1 : 0.95
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="panel p-8 border-neon-green relative">
        <div className="absolute -top-3 left-6 bg-paper px-2 py-1 border-2 border-charcoal rounded-md font-mono text-xs tracking-widest">QUESTION</div>
        {/* Question */}
        <div className="text-center mb-8">
          <motion.div
            className="math-expression font-body text-2xl md:text-3xl text-charcoal leading-relaxed"
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <MathText text={question.question_text} />
          </motion.div>
        </div>

        {/* Answer (for revision mode) */}
        {showAnswer && question.answer_text && (
          <motion.div
            className="mt-8 pt-6 border-t-2 border-deep-green-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <div className="text-center">
              <h4 className="font-heading text-lg font-semibold text-deep-green-700 mb-3 uppercase tracking-widest">
                Answer
              </h4>
              <div className="math-expression font-body text-xl text-charcoal bg-paper p-4 rounded-2xl border-2 border-neon-green shadow-bezel">
                <MathText text={question.answer_text} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Difficulty Badge */}
        {question.difficulty && (
          <motion.div
            className="absolute top-4 right-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.2 }}
          >
            <span className={`
              px-3 py-1 rounded-full text-xs font-body font-medium border-2 border-charcoal bg-yellow-bright text-charcoal shadow-bezel uppercase tracking-widest
            `}>
              {question.difficulty}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default QuestionCard;
