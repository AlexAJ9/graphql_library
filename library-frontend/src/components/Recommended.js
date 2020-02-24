import React, { useState } from 'react'

const Recommend = ({ user, books, show }) => {
    if (!show) {
        return null
    }
    const loggedUser = user.data.me;
    const filteredBooks = books.data.allBooks.filter(book => book.genres.includes(loggedUser.favouriteGenre))
    return (
        <div>
            <h2>Recommendations</h2>
            <p>books in <em>{loggedUser.username}</em>'s favourite genre: <em>{loggedUser.favouriteGenre}</em></p>
            <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {filteredBooks.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
        </div>
    )

}


export default Recommend