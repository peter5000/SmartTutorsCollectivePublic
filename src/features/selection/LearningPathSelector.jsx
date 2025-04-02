import React from 'react';

const LearningPathSelector = ({ onSelect, learningPaths }) => {
  return (
    <div className="learning-path-selection">
    {learningPaths.map((learningPath) => (
      <label key={learningPath.learningPath}>
        <input
          type="radio"
          name="learning-path"
          value={JSON.stringify(learningPath)}
          onChange={(e) => onSelect("learning path", e.target.value)}
        />
        <div className="learning-path-contatiner" key={learningPath.learningPath}>
        <p> {learningPath.learningPath}</p>
        <p> {"Summary: " + learningPath.summary}</p>
      </div>
      </label>
    ))}
  </div>
  );
};

export default LearningPathSelector;