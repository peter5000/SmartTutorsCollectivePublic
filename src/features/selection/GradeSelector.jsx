import React from 'react';

const GradeSelector = ({ onSelect }) => {
  return (
    <div>
      <label>Grade: </label>
      <input type="text" onChange={(e) => onSelect('grade', e.target.value)} />
    </div>
  );
};

export default GradeSelector;