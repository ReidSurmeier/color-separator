'use client';

import { useState } from 'react';
import { QUIZ_QUESTIONS } from '@/lib/gametest/quizContent';

interface QuizSectionProps {
  onSubmit: (answers: number[]) => void;
}

export default function QuizSection({ onSubmit }: QuizSectionProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    if (submitted) return;
    const answerArray = QUIZ_QUESTIONS.map((q) => answers[q.id] ?? -1);
    setSubmitted(true);
    onSubmit(answerArray);
  };

  const allAnswered = QUIZ_QUESTIONS.every((q) => answers[q.id] !== undefined);

  return (
    <div style={{
      padding: '48px 32px',
      maxWidth: '700px',
      margin: '0 auto',
      fontFamily: 'Georgia, "Times New Roman", serif',
    }}>
      {/* Header */}
      <div style={{
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '11px',
        color: '#999',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: '4px',
      }}>
        COMPREHENSION ASSESSMENT
      </div>
      <div style={{
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '12px',
        color: '#666',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '2px solid #333',
      }}>
        Section 2 of 3 &mdash; Answer all questions based on the reading above
      </div>

      {/* Questions */}
      {QUIZ_QUESTIONS.map((q, qi) => (
        <div key={q.id} style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#222',
            marginBottom: '12px',
          }}>
            <span style={{
              fontFamily: '"Courier New", monospace',
              fontSize: '13px',
              color: '#999',
              marginRight: '8px',
            }}>
              {String(qi + 1).padStart(2, '0')}.
            </span>
            {q.question}
          </div>
          <div style={{ paddingLeft: '28px' }}>
            {q.options.map((opt, oi) => {
              const isSelected = answers[q.id] === oi;
              const isCorrect = submitted && oi === q.correctIndex;
              const isWrong = submitted && isSelected && oi !== q.correctIndex;
              return (
                <label
                  key={oi}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '6px 8px',
                    marginBottom: '4px',
                    cursor: submitted ? 'default' : 'pointer',
                    borderRadius: '4px',
                    background: isCorrect ? 'rgba(0, 200, 0, 0.08)' : isWrong ? 'rgba(200, 0, 0, 0.08)' : isSelected ? '#f5f5f5' : 'transparent',
                    fontFamily: 'Georgia, serif',
                    fontSize: '15px',
                    lineHeight: 1.5,
                    color: '#333',
                    transition: 'background 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={isSelected}
                    onChange={() => handleSelect(q.id, oi)}
                    disabled={submitted}
                    style={{ marginTop: '5px', accentColor: '#333' }}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {/* Submit */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          style={{
            display: 'block',
            margin: '24px auto',
            padding: '12px 48px',
            background: allAnswered ? '#111' : '#ccc',
            color: allAnswered ? '#fff' : '#888',
            border: 'none',
            fontFamily: '"Courier New", monospace',
            fontSize: '14px',
            letterSpacing: '0.1em',
            cursor: allAnswered ? 'pointer' : 'default',
            transition: 'background 0.2s',
          }}
        >
          SUBMIT ASSESSMENT
        </button>
      )}
    </div>
  );
}
