import React from 'react';

const BookSelector = ({ onSelect, books }) => {
  return (
    <div className="book-selection">
    {books.map((book, index) => (
      <label key={book.title}>
        <input
          type="radio"
          name="book"
          value={book.title}
          onChange={(e) => onSelect("book", e.target.value)}
        />
        {index+1}
      </label>
    ))}
    {books.map((book, index) => (
      <div className="book-contatiner" key={book.title}>
        <p> {`${index+1}. ` + book.title}</p>
        <p> {"Author: " + book.author}</p>
        <p> {"Summary: " + book.summary}</p>
      </div>
    ))}
  </div>
  );
};

export default BookSelector;