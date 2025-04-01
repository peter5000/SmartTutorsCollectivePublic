import React, { useState } from 'react';

const EvalQuiz = ({ quiz, onDone }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <div className="quiz-container">No quiz available</div>;
  }


  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleDone = async () => {
    onDone();
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="quiz-container">
      <div className="quiz-title">Evaluated Quiz</div>
      <p className="quiz-question">{currentQuestion.question}</p>
      <ul className="quiz-options">
        {currentQuestion.options.map((option, index) => (
          <li key={index} className={"quiz-option " + (currentQuestion.chosenAnswer === index && currentQuestion.chosenAnswer != currentQuestion.correctAnswer ? "quiz-incorrect" : ' ') +
            (currentQuestion.correctAnswer == index ? "quiz-correct" : ' ')}>
            <label htmlFor={`option-${currentQuestionIndex}-${index}`}>
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`}
                id={`option-${currentQuestionIndex}-${index}`}
                value={index}
                checked={currentQuestion.chosenAnswer === index}
                disabled
              />
                <span className="quiz-option-text">{option}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="quiz-explanation">{currentQuestion.explanation}</p>
      <div className="quiz-navigation">
        {currentQuestionIndex > 0 && (
          <button className="quiz-navigation-button" onClick={handlePreviousQuestion}>
            Previous
          </button>
        )}
        {!isLastQuestion && (
          <button className="quiz-navigation-button" onClick={handleNextQuestion}>
            Next
          </button>
        )}
        {
          <button className="quiz-submit" onClick={handleDone}>
            Close Evaluated Quiz
          </button>
        }
      </div>
    </div>
  );
};

export default EvalQuiz;