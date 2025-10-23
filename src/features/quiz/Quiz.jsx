import React, { useState } from 'react';
import axios from 'axios';

const Quiz = ({ quiz, onQuizComplete, subject, age, grade, level, topic, firstQuiz }) => {
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState(
    quiz?.questions?.map((question) => ({
      ...question,
      chosenAnswer: -1,
    })) || []
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showEvaluationPrompt, setShowEvaluationPrompt] = useState(firstQuiz); // State for the prompt

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <div className="quiz-container">No quiz available</div>;
  }

  const handleOptionChange = (optionIndex) => {
    setQuestionsWithAnswers((prevQuestions) =>
      prevQuestions.map((q, index) =>
        index === currentQuestionIndex ? { ...q, chosenAnswer: optionIndex } : q
      )
    );
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
  };

  const handleSubmit = async () => {
    document.querySelector('.quiz-submit').textContent = 'Waiting for result...';
    document.querySelector('.quiz-submit').disabled = true;
    try {
      const response = await axios.post('/ai/evaluate-quiz', {
        grade,
        subject,
        age,
        level,
        quiz: { questions: questionsWithAnswers },
        topic,
      });
      onQuizComplete?.(response.data);
    } catch (error) {
      console.error('Error evaluating quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const currentQuestion = questionsWithAnswers[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questionsWithAnswers.length - 1;
  const questionWithNum = `${currentQuestionIndex + 1}. ${currentQuestion.question}`

  const handleEvaluationPromptResponse = (response) => {
    if (response === 'yes') {
      setShowEvaluationPrompt(false); // Hide the prompt and continue the quiz flow
    } else {
      setShowEvaluationPrompt(false);
      onQuizComplete?.(null); // Optionally, trigger a callback to signal quiz is skipped
    }
  };

  if (showEvaluationPrompt) {
    return (
      <div className="quiz-container">
        <p>Would you like to take the evaluation now?</p>
        <div className="eval-confirmation">
          <button onClick={() => handleEvaluationPromptResponse('yes')}>Yes</button>
          <button onClick={() => handleEvaluationPromptResponse('no')}>No</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">Quiz</h2>
      <p className="quiz-question">{questionWithNum}</p>
      <ul className="quiz-options">
        {currentQuestion.options.map((option, index) => (
          <li key={index} className="quiz-option">
            <label htmlFor={`option-${currentQuestionIndex}-${index}`} aria-label={option}>
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
        {currentQuestionIndex > 0 && (
          <button className="quiz-navigation-button" onClick={handlePreviousQuestion}>
            Previous
          </button>
        )}
        {!isLastQuestion ? (
          <button className="quiz-navigation-button" onClick={handleNextQuestion}>
            Next
          </button>
        ) : (
          <button className="quiz-submit" onClick={handleSubmit}>
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
