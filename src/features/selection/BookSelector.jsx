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
          onChange={(e) => onSelect(e.target.value, books[index].author)}
        />
        <div className="book-contatiner" key={book.title}>
        <p> {`${index+1}. ` + book.title}</p>
        <p> {"Author: " + book.author}</p>
        <p> {"Summary: " + book.summary}</p>
      </div>
      </label>
    ))}
  </div>
  );
};

export default BookSelector;