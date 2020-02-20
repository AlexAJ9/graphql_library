import { gql } from 'apollo-boost'
import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'

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
const SET_YEAR = gql`
  mutation setYear($name: String!, $born: Int!){
    editAuthor(name:$name, born:$born)
    {
      name
      born
    } 
}
`
const ALL_AUTHORS = gql`
{
  allAuthors{ 
    name
    born
    bookCount
  }
}
`

const ALL_BOOKS = gql`
  {
    allBooks{ 
      title
      published
      author
    }
  }
 `

const App = () => {

  const [errorMessage, setErrorMessage] = useState(null)
  const [page, setPage] = useState('authors')

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)

  const handleError = (err) => {
    setErrorMessage(err.graphQLErrors[0].message)
    setTimeout(() => { setErrorMessage(null) }, 10000)
  }

  const [editAuthor] = useMutation(SET_YEAR, {
    onError: handleError,
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const [addBook] = useMutation(CREATE_BOOK, {
    onError: handleError,
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }]
  })

  return (

    <div>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors result={authors} editAuthor={editAuthor} show={page === 'authors'} />
      <Books result={books} show={page === 'books'} />
      <NewBook addBook={addBook} show={page === 'add'} />

    </div>

  )
}

export default App