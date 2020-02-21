const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { ApolloServer, UserInputError, gql } = require('apollo-server')

const Book = require('./models/Book')
const User = require('./models/User')
const Author = require('./models/Author')


require('dotenv').config()

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connection to MongoDB:', error.message)
    })

const typeDefs = gql`

    type Book {
        title: String!,
        author: Author!,
        published: Int!,
        genres:[String!]!
    }
    type User {
        username: String!,
        favouriteGenre:String!,
        id: ID!
    }
    type Token {
        value: String!
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
        me: User!
        },
    type Mutation {
        addBook(
            title: String!,
            author: String!,
            published: Int!,
            genres: [String!]!,
        ):Book,
        createUser(
            username:String!
            favouriteGenre:String!
        ):User,
        login(
            username:String!,
            password:String!
        ):Token,
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
        me: (root, args, context) => { return context.currentUser }
    },
    Author: {
        bookCount: async (root, args) => { return Book.countDocuments({ author: root }) }
    },
    Mutation: {
        createUser: (root, args) => {
            const user = new User({ ...args })
            return user.save().catch(err => { throw new UserInputError(err.message, { invalidArgs: args }) })
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })
            if (!user || args.password == 'french79') {
                throw new UserInputError('Invalid credentials!')
            }
            const uToken = { username: user.username, id: user._id }
            return { value: jwt.sign(uToken, process.env.SECRET) }
        },
        addBook: async (root, args, context) => {

            const user = context.currentUser
            if (!user) {
                throw new AuthenticationError('You have to be logged in to perform this action!')
            }

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
            const user = context.currentUser
            if (!user) {
                throw new AuthenticationError('You have to be logged in to perform this action!')
            }
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
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.toLocaleLowerCase.startsWith('bearer')) {
            const decodedToken = jwt.verify(auth.toSubstring(7), process.env.SECRET)
        }
        const currentUser = await User.findById(decodedToken.id)
        return currentUser
    }
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})