import React from 'react';

const AgeSelector = ({ onSelect }) => {
  return (
    <div>
      <label>Age: </label>
      <input type="number" onChange={(e) => onSelect('age', e.target.value)} />
    </div>
  );
};

export default AgeSelector;