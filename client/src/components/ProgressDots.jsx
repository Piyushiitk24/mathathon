import React from 'react';
import { motion } from 'framer-motion';

function ProgressDots({ questions, currentIndex, answers }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 p-4 bg-white rounded-2xl shadow-card">
      <div className="w-full text-center mb-2">
        <span className="font-body text-sm text-text-subtle">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {questions.map((_, index) => {
          const isAnswered = answers.some(answer => answer.qId === questions[index].id);
          const isCurrent = index === currentIndex;
          
          return (
            <motion.div
              key={index}
              className={`
                w-3 h-3 rounded-full progress-dot cursor-pointer
                ${isCurrent ? 'current' : isAnswered ? 'answered' : 'unanswered'}
              `}
              onClick={() => {
                // This will be handled by parent component
                // We can pass an onDotClick prop if needed
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
            />
          );
        })}
      </div>
      
      <div className="w-full text-center mt-2">
        <div className="flex justify-center space-x-4 text-xs font-body text-text-subtle">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full progress-dot answered"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full progress-dot current"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full progress-dot unanswered"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressDots;
