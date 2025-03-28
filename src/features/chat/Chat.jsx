import React from 'react';

const Chat = ({ messages }) => {
  return (
    <div>
      {messages.map((msg, index) => (
        <div key={index} className="chat-message">
          <strong>{msg.sender}:</strong> {msg.text}
        </div>
      ))}
    </div>
  );
};

export default Chat;