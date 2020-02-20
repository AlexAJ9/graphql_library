import { gql } from 'apollo-boost'
import React, { useState } from 'react'
import { Mutation, ApolloConsumer } from 'react-apollo'


import Books from './components/Books'
import NewBook from './components/NewBook'
import Authors from './components/Authors'

const CREATE_BOOK = gql`
    mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
      addBook(
        title: $title,
        author: $author,
        published: $published,
        genres: $genres
      ){
        title
        author
        published
        genres
      }
    }
`

const App = () => {
  const [page, setPage] = useState('authors')

  return (

    <div>

      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors
        show={page === 'authors'}
      />

      <Books
        show={page === 'books'}
      />

      <Mutation mutation={CREATE_BOOK}>
        {( addBook ) => <NewBook addBook={addBook} show={page === 'add'} />}
      </Mutation>
    </div>

  )
}

export default App