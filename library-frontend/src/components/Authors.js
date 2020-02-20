import Select from 'react-select'
import React, { useState } from 'react'
import { useApolloClient } from '@apollo/react-hooks'

const Authors = (props) => {

  const client = useApolloClient()

  const [author, setAuhtor] = useState('')
  const [year, setYear] = useState('')

  const options = []

  const handleChange = selectedOption => {
    setAuhtor(selectedOption.value)
  }

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
  if (props.result.loading) {
    return <div>loading...</div>
  }

  const data = props.result.data.allAuthors
  data.map(x => x.name).forEach(x => options.push({ value: x, label: x }))

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
          {data.map(a =>
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
        <Select options={options} onChange={handleChange} />
        <div>year: <input type="text" value={year} onChange={({ target }) => setYear(Number(target.value))}></input></div>
        <div><button type='submit'>submit</button></div>
      </form>
    </div>
  )
}

export default Authors