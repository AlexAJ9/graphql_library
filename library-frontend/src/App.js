import { gql } from 'apollo-boost'
import React, { useState } from 'react'
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/react-hooks'

import Books from './components/Books'
import Login from './components/Login'
import NewBook from './components/NewBook'
import Authors from './components/Authors'
import Recommended from './components/Recommended'

const CREATE_BOOK = gql`
    mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
      addBook(
        title: $title,
        author: $author,
        published: $published,
        genres: $genres
      ){
        title,
        published,
        genres,
        author{
          name
        }
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
      genres
      author{
        name
      }
    }
  }
 `
const LOGIN = gql`
mutation login($username: String!, $password: String!){
  login(username: $username, password: $password){
    value
  }
}
`
const USER = gql`
{
  me{
    username
    favouriteGenre
  }
}
`

const BOOK_DETAILS = gql`
fragment BookDetails on Book {
  title
  published
  genres
  author {
    name
  }
}`
const BOOK_ADDED = gql`
subscription {    
  bookAdded {
    ...BookDetails
   }  
  }  
  ${BOOK_DETAILS}
`
const App = () => {
  const client = useApolloClient()

  const [errorMessage, setErrorMessage] = useState(null)
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const user = useQuery(USER)

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      window.alert(`Book: ${subscriptionData.data.bookAdded.title} added.`)
      updateCache(subscriptionData.data.bookAdded)
    }
  })
  const updateCache = (addedBook) => {
    const includeIn = (set, object) => set.map(x => x.title).includes(object.title)
    const dataInCache = client.readQuery({ query: ALL_BOOKS })
    if (!includeIn(dataInCache.allBooks, addedBook)) {
      dataInCache.allBooks.push(addedBook)
      client.writeQuery({ query: ALL_BOOKS, data: dataInCache })
    }
  }
  const logout = () => {
    window.localStorage.clear()
    setToken(null)
    client.resetStore()
  }

  const handleError = (error) => {
    setErrorMessage(error.message)
    setTimeout(() => { setErrorMessage(null) }, 10000)
  }

  const [editAuthor] = useMutation(SET_YEAR, {
    onError: handleError,
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const [addBook] = useMutation(CREATE_BOOK, {
    onError: handleError,
    update: (store, response) => {
      console.log(response.data.addBook)
      updateCache(response.data.addBook)
    }
  })

  const [login] = useMutation(LOGIN, { onError: handleError })

  if (!token) {
    return (
      <div>
        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('login')}>login</button>
        </div>
        <Login setToken={(token) => setToken(token)} login={login} show={page === 'login'} setPage={(page) => setPage(page)} />
        <Authors result={authors} editAuthor={editAuthor} show={page === 'authors'} />
        <Books result={books} show={page === 'books'} />
      </div>
    )
  }
  return (

    <div>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('recommended')}>recommended</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={logout} >logout</button>
      </div>

      <Authors result={authors} editAuthor={editAuthor} show={page === 'authors'} />
      <Recommended user={user} books={books} show={page === 'recommended'} />
      <NewBook addBook={addBook} show={page === 'add'} />
      <Books result={books} show={page === 'books'} />
    </div>

  )
}

export default App