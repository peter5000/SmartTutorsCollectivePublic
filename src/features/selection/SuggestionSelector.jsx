import React from 'react';

const SuggestionSelector = ({ onSelect }) => {
  const suggestions = ['Learning Paths', 'Books', 'Subject'];

  return (
    <div className="suggestion-selection" hidden={true}>
    {suggestions.map((suggestion) => (
      <label key={suggestion}>
        <input
          type="radio"
          name="suggestion"
          value={suggestion}
          onChange={(e) => onSelect("selected", e.target.value)}
        />
        {suggestion}
      </label>
    ))}
  </div>
  );
};

export default SuggestionSelector;