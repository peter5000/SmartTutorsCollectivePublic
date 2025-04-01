import React from 'react';

const TopicSelector = ({ onSelect, topics }) => {
  return (
    <div className="topic-selection">
    {topics.map((topic) => (
      <label key={topic.topic}>
        <input
          type="radio"
          name="topic"
          value={topic.topic}
          onChange={(e) => onSelect("topic", e.target.value)}
        />
        {topic.topic}
      </label>
    ))}
  </div>
  );
};

export default TopicSelector;