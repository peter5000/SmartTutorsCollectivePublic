import React from 'react';

const TopicSelector = ({ onSelect, topics }) => {
  return (
    <div className="topic-selection">
    {topics.map((topic) => (
      <label key={topic}>
        <input
          type="radio"
          name="topic"
          value={topic}
          onChange={(e) => onSelect("topic", e.target.value)}
        />
        {topic}
      </label>
    ))}
  </div>
  );
};

export default TopicSelector;