import React from 'react';

const SuggestionSelector = ({ onSelect }) => {
  const suggestions = ['Topics', 'Books'];

  return (
    <div className="suggestion-selection" hidden={true}>
    {suggestions.map((suggestion) => (
      <label key={suggestion}>
        <input
          type="radio"
          name="suggestion"
          value={suggestion}
          onChange={(e) => onSelect("suggestion", e.target.value)}
        />
        {suggestion}
      </label>
    ))}
  </div>
  );
};

export default SuggestionSelector;