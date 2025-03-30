import React, { useState } from 'react';

const Quiz = ({ quiz, onSaveAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <div className="quiz-container">No quiz available</div>;
  }

  const questionObj = quiz.questions[0];

  const handleOptionChange = (index) => {
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption !== null) {
      onSaveAnswer(selectedOption+1);
    }
  };

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">Quiz</h2>
      <p className="quiz-question">{questionObj.question}</p>
      <ul className="quiz-options">
        {questionObj.options.map((option, index) => (
          <li key={index} className="quiz-option">
            <label>
              <input
                type="radio"
                name="quiz-option"
                value={index}
                checked={selectedOption === index}
                onChange={() => handleOptionChange(index)}
              />
              <label className="quiz-option-text">{option}</label>
            </label>
          </li>
        ))}
      </ul>
      <button className="quiz-submit" onClick={handleSubmit}>Submit Answer</button>
    </div>
  );
};

export default Quiz;