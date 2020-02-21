const mongoose = require('mongoose')
const { ApolloServer, UserInputError, gql } = require('apollo-server')

const Book = require('./models/Book')
const Author = require('./models/Author')


require('dotenv').config()

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connection to MongoDB:', error.message)
    })

// let authors = [
//     {
//         name: 'Robert Martin',
//         id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
//         born: 1952,
//     },
//     {
//         name: 'Martin Fowler',
//         id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
//         born: 1963
//     },
//     {
//         name: 'Fyodor Dostoevsky',
//         id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
//         born: 1821
//     },
//     {
//         name: 'Joshua Kerievsky', // birthyear not known
//         id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
//     },
//     {
//         name: 'Sandi Metz', // birthyear not known
//         id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
//     },
// ]



// let books = [
//     {
//         title: 'Clean Code',
//         published: 2008,
//         author: 'Robert Martin',
//         id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
//         genres: ['refactoring']
//     },
//     {
//         title: 'Agile software development',
//         published: 2002,
//         author: 'Robert Martin',
//         id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
//         genres: ['agile', 'patterns', 'design']
//     },
//     {
//         title: 'Refactoring, edition 2',
//         published: 2018,
//         author: 'Martin Fowler',
//         id: "afa5de00-344d-11e9-a414-719c6709cf3e",
//         genres: ['refactoring']
//     },
//     {
//         title: 'Refactoring to patterns',
//         published: 2008,
//         author: 'Joshua Kerievsky',
//         id: "afa5de01-344d-11e9-a414-719c6709cf3e",
//         genres: ['refactoring', 'patterns']
//     },
//     {
//         title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
//         published: 2012,
//         author: 'Sandi Metz',
//         id: "afa5de02-344d-11e9-a414-719c6709cf3e",
//         genres: ['refactoring', 'design']
//     },
//     {
//         title: 'Crime and punishment',
//         published: 1866,
//         author: 'Fyodor Dostoevsky',
//         id: "afa5de03-344d-11e9-a414-719c6709cf3e",
//         genres: ['classic', 'crime']
//     },
//     {
//         title: 'The Demon',
//         published: 1872,
//         author: 'Fyodor Dostoevsky',
//         id: "afa5de04-344d-11e9-a414-719c6709cf3e",
//         genres: ['classic', 'revolution']
//     },
// ]

const typeDefs = gql`

    type Book {
    title: String!,
    author: Author!,
    published: Int!,
    genres:[String!]!
    }

    type Author {
        name: String!,
        id: ID!,
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
        bookCount: () => { return Book.collection.countDocuments() },
        authorCount: () => { return Book.collection.countDocuments() },
        allAuthors: async () => { return await Author.find({}) },
        allBooks: async (root, args) => {
            return await Book.find({}).populate('author')
            // if (args.genre && args.author) {
            //     let x = books.filter(x => x.author === args.author)
            //     return x.filter(x => x.genres.includes(args.genre))
            // }
            // if (args.genre) { return books.filter(x => x.genres.includes(args.genre)) }
            // if (args.author) { return books.filter(x => x.author === args.author) }
            // return books
        },
    },
    Author: {
        bookCount: async (root, args) => { return Book.countDocuments({ author: root }) }
    },
    Mutation: {
        addBook: async (root, args) => {

            const authorExists = await Author.findOne({ name: args.author })
            if (!authorExists) {
                const author = new Author({ "name": args.author })
                try {
                    await author.save()
                }
                catch (err) {
                    throw new UserInputError(err.message, { invalidArgs: args })
                }
            }

            const authorInDb = await Author.findOne({ name: args.author })

            const book = new Book({ ...args, author: authorInDb })
            try {
                const bookToSave = await book.save()
                return bookToSave
            }
            catch (err) {
                throw new UserInputError(err.message, { invalidArgs: args })
            }

            // let book = books.find(x => x.title === args.title)
            // if (!book) {
            //     book = { ...args, id: uuid() }
            //     books = books.concat(book)
            //     return book
            // }
            // const updatedBook = { title: args.title, author: args.author, published: args.published, genres: args.genres }
            // books = books.map(book => book.title === args.title ? updatedBook : book)
            // return updatedBook
        },
        editAuthor: async (root, args) => {
            const authorToEdit = await Author.findOne({ name: args.name })
            authorToEdit.born = args.born
            try {
                await authorToEdit.save()
                return authorToEdit
            }
            catch (err) {
                throw new UserInputError(err.message, { invalidArgs: args })
            }
            // const author = authors.find(x => x.name === args.name)
            // if (!author) { return null }
            // const authorToUpdate = { ...author, born: args.born }
            // authors = authors.map(author => author.name === args.name ? authorToUpdate : author)
            // return authorToUpdate
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