import React from 'react';

const BookQuery = ({ onQuery, onQuit }) => {
  return (
    <div>
      <label>Query: </label>
      <input id="book-query-input"/>
      <button onClick={() => {
        onQuery(document.getElementById("book-query-input").value);
        document.getElementById("book-query-input").value = "";
      }}>
        Submit
      </button>
      <button onClick={onQuit()}>
        Exit Chat
      </button>
    </div>
  );
};

export default BookQuery;