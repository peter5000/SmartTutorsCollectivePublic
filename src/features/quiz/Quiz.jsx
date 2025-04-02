import React, { useState } from 'react';
import axios from 'axios';

const Quiz = ({ quiz, onQuizComplete, subject, age, grade, level, topic }) => {
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState(
    quiz.questions.map((question) => ({
      ...question,
      chosenAnswer: -1,
    }))
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <div className="quiz-container">No quiz available</div>;
  }

  const handleOptionChange = (optionIndex) => {
    setQuestionsWithAnswers((prevQuestions) => {
      const updatedQuestions = prevQuestions.map((q, index) => {
        if (index === currentQuestionIndex) {
          return { ...q, chosenAnswer: optionIndex };
        }
        return q;
      });
      return updatedQuestions;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionsWithAnswers.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      document.querySelector('.quiz-submit').textContent = 'Waiting for result...';
      document.querySelector('.quiz-submit').disabled = true;
      const response = await axios.post('http://localhost:5000/evaluate-quiz', {
        grade,
        subject,
        age,
        level,
        quiz: { questions: questionsWithAnswers },
        topic
      });
      const evaluationResult = response.data;
      console.log('Evaluation Result:', evaluationResult);
      // Pass the evaluation result to the parent component or handle it here
      if (onQuizComplete) {
        onQuizComplete(evaluationResult);
      }
    } catch (error) {
      console.error('Error evaluating quiz:', error);
    }
  };

  const currentQuestion = questionsWithAnswers[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questionsWithAnswers.length - 1;

  return (
    <div className="quiz-container">
      <div className="quiz-title">Quiz</div>
      <p className="quiz-question">{currentQuestion.question}</p>
      <ul className="quiz-options">
        {currentQuestion.options.map((option, index) => (
          <li key={index} className="quiz-option">
            <label htmlFor={`option-${currentQuestionIndex}-${index}`}>
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`}
                id={`option-${currentQuestionIndex}-${index}`}
                value={index}
                checked={currentQuestion.chosenAnswer === index}
                onChange={() => handleOptionChange(index)}
              />
              <span className="quiz-option-text">{option}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="quiz-navigation">
        {!isLastQuestion && (
          <button className="quiz-navigation-button" onClick={handleNextQuestion}>
            Next
          </button>
        )}
        {isLastQuestion && (
          <button className="quiz-submit" onClick={handleSubmit}>
            Submit Quiz
          </button>
        )}
        {currentQuestionIndex > 0 && (
          <button className="quiz-navigation-button" onClick={handlePreviousQuestion}>
            Previous
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;