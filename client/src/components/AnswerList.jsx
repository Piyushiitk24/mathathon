import React from 'react';
import { motion } from 'framer-motion';
import MathText from './MathText';

function AnswerList({ question, selectedAnswer, onAnswerSelect, showCorrect = false }) {
  const options = [
    { key: 'A', value: question.option_a },
    { key: 'B', value: question.option_b },
    { key: 'C', value: question.option_c },
    { key: 'D', value: question.option_d }
  ].filter(option => option.value);

  const getOptionStyle = (optionKey) => {
    if (!showCorrect) {
      return selectedAnswer === optionKey
        ? 'bg-neon-green text-charcoal border-charcoal'
        : 'bg-paper text-charcoal border-charcoal hover:shadow-glow-green';
    }

    if (optionKey === question.correct_option) {
      return 'bg-neon-green text-charcoal border-charcoal';
    } else if (selectedAnswer === optionKey && optionKey !== question.correct_option) {
      return 'bg-error text-white border-charcoal';
    } else {
      return 'bg-paper text-text-subtle border-charcoal';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-3">
        {options.map((option, index) => (
          <motion.button
            key={option.key}
            onClick={() => !showCorrect && onAnswerSelect(option.key)}
            disabled={showCorrect}
            className={`
              w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left shadow-bezel
              ${getOptionStyle(option.key)}
              ${!showCorrect ? 'cursor-pointer' : 'cursor-default'}
            `}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.25 }}
            whileHover={!showCorrect ? { scale: 1.02 } : {}}
            whileTap={!showCorrect ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center space-x-4">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-sm border-2 border-charcoal
                ${selectedAnswer === option.key && !showCorrect
                  ? 'bg-paper text-charcoal'
                  : showCorrect && option.key === question.correct_option
                  ? 'bg-charcoal text-neon-green'
                  : showCorrect && selectedAnswer === option.key && option.key !== question.correct_option
                  ? 'bg-charcoal text-error'
                  : 'bg-paper text-charcoal'
                }
              `}>
                {option.key}
              </div>
              
              <div className="flex-1 math-expression font-body text-lg">
                <MathText text={option.value} />
              </div>

              {showCorrect && (
                <div className="flex-shrink-0">
                  {option.key === question.correct_option ? (
                    <div className="w-6 h-6 bg-charcoal rounded-full flex items-center justify-center border-2 border-neon-green">
                      <span className="text-neon-green text-sm">✓</span>
                    </div>
                  ) : selectedAnswer === option.key ? (
                    <div className="w-6 h-6 bg-charcoal rounded-full flex items-center justify-center border-2 border-error">
                      <span className="text-error text-sm">✗</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {showCorrect && question.answer_text && (
        <motion.div
          className="mt-6 p-4 bg-paper rounded-2xl border-2 border-charcoal"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.25 }}
        >
          <h4 className="font-heading tracking-widest uppercase font-semibold text-charcoal mb-2">
            Explanation
          </h4>
          <p className="math-expression font-body text-charcoal">
            <MathText text={question.answer_text} />
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default AnswerList;
