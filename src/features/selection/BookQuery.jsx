import React from 'react';

const BookQuery = ({ onQuery, onQuit }) => {
  return (
    <div>
      <select id="book-query-input">
        <option>What is the main focus or theme of this book?</option>
        <option>Which topics are covered in this book?</option>
        <option>Can you suggest similar books on the same subject?</option>
        <option>Where can I purchase this book?</option>
        <option>What makes this book worth reading?</option>
        <option>Are there any notable reviews or ratings for this book?</option>
      </select>
      <div className="book-selection-box">
        <button onClick={() => {
        onQuery(document.getElementById("book-query-input").value);
        document.getElementById("book-query-input");
      }}>
        Submit Query
        </button>
        <button onClick={onQuit}>
          Exit Chat
        </button>
      </div>
      
    </div>
  );
};

export default BookQuery;