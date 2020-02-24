import React, { useState } from 'react'

const Books = (props) => {

  const [genre, setGenre] = useState(null)

  if (!props.show) {
    return null
  }
  if (!props.result) {
    return <div>...loading</div>
  }

  const filteredBooks = props.result.data.allBooks.filter(book => genre ? book.genres.includes(genre) : book)

  return (


    < div >
      <h2>books</h2>
      <p><em>{genre ? `in genre ${genre}` : 'all genres'}</em></p>
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
      <div>
        <button onClick={() => setGenre('refactoring')}>refactoring</button>
        <button onClick={() => setGenre('patterns')}>patterns</button>
        <button onClick={() => setGenre('design')}>design</button>
        <button onClick={() => setGenre('agile')}>agile</button>
        <button onClick={() => setGenre('classic')}>classic</button>
        <button onClick={() => setGenre('crime')}>crime</button>
        <button onClick={() => setGenre('revolution')}>revolution</button>
      </div>
    </div >
  )
}

export default Books