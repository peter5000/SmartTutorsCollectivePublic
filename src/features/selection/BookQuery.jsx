import React from 'react';

const BookQuery = ({ onQuery, onQuit }) => {
  return (
    <div>
      <select id="book-query-input">
        <option>What is this book about?</option>
        <option>What topics are covered in this book?</option>
        <option>Are there any similar books on the same topic?</option>
        <option>Where can I buy this book?</option>
        <option>Why should I read this book?</option>
        <option>What are some reviews or ratings for this book?</option>
      </select>
      <div className="book-selection-box">
        <button onClick={() => {
        onQuery(document.getElementById("book-query-input").value);
        document.getElementById("book-query-input");
      }}>
        Submit Query
        </button>
        <button onClick={onQuit()}>
          Exit Chat
        </button>
      </div>
      
    </div>
  );
};

export default BookQuery;