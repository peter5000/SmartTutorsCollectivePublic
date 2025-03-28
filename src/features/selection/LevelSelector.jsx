import React from 'react';

const LevelSelector = ({ onSelect }) => {
  const levels = ['Beginner', 'Intermediate', 'Expert'];

  return (
    <div>
      <div>
        {levels.map((level) => (
          <label key={level}>
            <input
              type="radio"
              name="level"
              value={level}
              onChange={(e) => onSelect('level', e.target.value)}
            />
            {level}
          </label>
        ))}
      </div>
    </div>
  );
};

export default LevelSelector;