const { ApolloServer, gql } = require('apollo-server')
const uuid = require('uuid')

let authors = [
    {
        name: 'Robert Martin',
        id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
        born: 1952,
    },
    {
        name: 'Martin Fowler',
        id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
        born: 1963
    },
    {
        name: 'Fyodor Dostoevsky',
        id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
        born: 1821
    },
    {
        name: 'Joshua Kerievsky', // birthyear not known
        id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
    },
    {
        name: 'Sandi Metz', // birthyear not known
        id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
    },
]



let books = [
    {
        title: 'Clean Code',
        published: 2008,
        author: 'Robert Martin',
        id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring']
    },
    {
        title: 'Agile software development',
        published: 2002,
        author: 'Robert Martin',
        id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
        genres: ['agile', 'patterns', 'design']
    },
    {
        title: 'Refactoring, edition 2',
        published: 2018,
        author: 'Martin Fowler',
        id: "afa5de00-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring']
    },
    {
        title: 'Refactoring to patterns',
        published: 2008,
        author: 'Joshua Kerievsky',
        id: "afa5de01-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring', 'patterns']
    },
    {
        title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
        published: 2012,
        author: 'Sandi Metz',
        id: "afa5de02-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring', 'design']
    },
    {
        title: 'Crime and punishment',
        published: 1866,
        author: 'Fyodor Dostoevsky',
        id: "afa5de03-344d-11e9-a414-719c6709cf3e",
        genres: ['classic', 'crime']
    },
    {
        title: 'The Demon',
        published: 1872,
        author: 'Fyodor Dostoevsky',
        id: "afa5de04-344d-11e9-a414-719c6709cf3e",
        genres: ['classic', 'revolution']
    },
]

const typeDefs = gql`
    type Book {
    title: String!,
    author: String!,
    published: String!,
    genres:[String!]!
    }

    type Author {
        name: String!,
        id: Int!,
        born: Int,
        bookCount: Int
    }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String,genre: String): [Book!]!
    allAuthors: [Author!]!
    findBook: Int!
  },

  type Mutation {
    addBook(
    title: String!,
    author: String!,
    published: Int!,
    genres: [String!]!,
    ):Book,

    editAuthor(
        name: String!,
        born: Int!
    ):Author
  }
`

const resolvers = {
    Query: {
        bookCount: () => { return books.length },
        authorCount: () => { return authors.length },
        allAuthors: () => { return authors },
        allBooks: (root, args) => {
            if (args.genre && args.author) {
                let x = books.filter(x => x.author === args.author)
                return x.filter(x => x.genres.includes(args.genre))
            }
            if (args.genre) { return books.filter(x => x.genres.includes(args.genre)) }
            if (args.author) { return books.filter(x => x.author === args.author) }
            return books
        },
    },
    Author: {
        bookCount: (root, args) => { return books.filter(x => x.author === root.name).length }
    },
    Mutation: {
        addBook: (root, args) => {
            let book = books.find(x => x.title === args.title)
            if (!book) {
                book = { ...args, id: uuid() }
                books = books.concat(book)
                return book
            }
            const updatedBook = { title: args.title, author: args.author, published: args.published, genres: args.genres }
            books = books.map(book => book.title === args.title ? updatedBook : book)
            return updatedBook
        },
        editAuthor: (root, args) => {
            const author = authors.find(x => x.name === args.name)
            if (!author) { return null }
            const authorToUpdate = { ...author, born: args.born }
            authors = authors.map(author => author.name === args.name ? authorToUpdate : author)
            return authorToUpdate
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})