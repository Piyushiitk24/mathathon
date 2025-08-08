import React from 'react';
import { MathJax } from 'better-react-mathjax';

// A tiny helper that renders strings containing LaTeX using MathJax.
// It supports mixed text + math, with inline ($...$) and display ($$...$$) math.
export default function MathText({ text, className }) {
  if (text == null) return null;
  return (
    <MathJax dynamic inline={false} className={className}>
      {String(text)}
    </MathJax>
  );
}
