import React from 'react';

const SubjectSelector = ({ onSelect }) => {
  const subjects = ['Math', 'Science', 'English'];

  return (
    <div>
      <div>
        {subjects.map((subject) => (
          <label key={subject}>
            <input
              type="radio"
              name="subject"
              value={subject}
              onChange={(e) => onSelect('subject', e.target.value)}
            />
            {subject}
          </label>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelector;