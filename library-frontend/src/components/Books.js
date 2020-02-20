import React from 'react'
import { gql } from 'apollo-boost'
import { Query } from 'react-apollo'

const ALL_BOOKS = gql`
  {
    allBooks{ 
      title
      published
      author
    }
  }
`

const Books = (props) => {
  if (!props.show) {
    return null
  }


  const books = []
  return <Query query={ALL_BOOKS} pollInterval={2000}>
    {(result) => {
      if (result.loading) { return <div>loading...</div> }
      return (
        <div>
          <h2>books</h2>

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
              {result.data.allBooks.map(a =>
                <tr key={a.title}>
                  <td>{a.title}</td>
                  <td>{a.author}</td>
                  <td>{a.published}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )
    }}
  </Query>
}

export default Books