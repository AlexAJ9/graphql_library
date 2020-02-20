import { gql } from 'apollo-boost'
import { Query } from 'react-apollo'
import React, { useState } from 'react'

const ALL_AUTHORS = gql`{

    allAuthors{ 
      name
      born
      bookCount
    }
}
`

const Authors = (props) => {

  const [author, setAuhtor] = useState('')
  const [year, setYear] = useState('')

  const updateYear = async (e) => {
    e.preventDefault()
    await props.editAuthor({
      variables: { name: author, born: year }
    })
    setAuhtor('')
    setYear('')
  }
  if (!props.show) {
    return null
  }
  const authors = []
  return <Query query={ALL_AUTHORS} pollInterval={2000}>
    {(result) => {
      if (result.loading) {
        return <div>loading...</div>
      }
      return (
        <div>
          <h2>authors</h2>
          <table>
            <tbody>
              <tr>
                <th></th>
                <th>
                  born
            </th>
                <th>
                  books
            </th>
              </tr>
              {result.data.allAuthors.map(a =>
                <tr key={a.name}>
                  <td>{a.name}</td>
                  <td>{a.born}</td>
                  <td>{a.bookCount}</td>
                </tr>
              )}
            </tbody>
          </table>
          <h2>Set birthyear</h2>
          <form onSubmit={updateYear}>
            <div>author:<input type="text" value={author} onChange={({ target }) => setAuhtor(target.value)}></input></div>
            <div>year: <input type="text" value={year} onChange={({ target }) => setYear(Number(target.value))}></input></div>
            <div><button type='submit'>submit</button></div>
          </form>
        </div>
      )
    }}

  </Query>
}

export default Authors