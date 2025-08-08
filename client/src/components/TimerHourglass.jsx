import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function TimerHourglass({ totalSeconds, onComplete, isActive = true }) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isActive) return;

    setTimeLeft(totalSeconds);
    setProgress(100);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        const newProgress = (newTime / totalSeconds) * 100;
        setProgress(Math.max(0, newProgress));

        if (newTime <= 0) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalSeconds, onComplete, isActive]);

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      className="flex flex-col items-center space-y-4"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Circular Progress Timer */}
      <div className="relative">
        <svg
          className="w-24 h-24 transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(107, 107, 107, 0.2)"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke={timeLeft <= 5 ? "#E74C3C" : "#2ECC71"}
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="timer-circle"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        
        {/* Time display in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`font-heading text-2xl font-bold ${
              timeLeft <= 5 ? 'text-error' : 'text-primary-green'
            }`}
            animate={{ 
              scale: timeLeft <= 5 ? [1, 1.1, 1] : 1,
              color: timeLeft <= 5 ? "#E74C3C" : "#2ECC71"
            }}
            transition={{ 
              duration: timeLeft <= 5 ? 0.5 : 0,
              repeat: timeLeft <= 5 ? Infinity : 0
            }}
          >
            {timeLeft}
          </motion.span>
        </div>
      </div>

      {/* Hourglass Animation */}
      <motion.div
        className="hourglass-animation"
        animate={{ 
          rotate: isActive ? [0, 180, 360] : 0,
          scale: timeLeft <= 5 ? [1, 1.1, 1] : 1
        }}
        transition={{ 
          rotate: { duration: 2, ease: "easeInOut", repeat: Infinity },
          scale: { duration: 0.5, repeat: Infinity }
        }}
      >
        <svg
          className="w-12 h-12 text-primary-green"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6,2V8H6V8L10,12L6,16V16H6V22H18V16H18V16L14,12L18,8V8H18V2H6M16,16.5V20H8V16.5L12,12.5L16,16.5M12,11.5L8,7.5V4H16V7.5L12,11.5Z" />
        </svg>
      </motion.div>

      {/* Timer Label */}
      <div className="text-center">
        <p className="font-body text-sm text-text-subtle">
          {timeLeft > 0 ? 'Time remaining' : 'Time\'s up!'}
        </p>
        {timeLeft <= 5 && timeLeft > 0 && (
          <motion.p
            className="font-body text-xs text-error font-semibold"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            Get ready for the next question...
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

export default TimerHourglass;
