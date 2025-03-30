import React from 'react';

const Chat = ({ messages }) => {
  return (
    <div>
      {messages.map((msg, index) => (
        <div key={index} className="chat-message">
          <strong>{msg.sender}:</strong> 
          <p>{msg.text}</p>
        </div>
      ))}
    </div>
  );
};

export default Chat;