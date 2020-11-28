// Library
const mongoose = require('mongoose')
const { ApolloServer, UserInputError, gql } = require('apollo-server')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { PubSub } = require('apollo-server')
const pubsub = new PubSub()

// File
const Food = require('./models/menu')
const Reservation = require('./models/reservation')
const User = require('./models/user')
const Deliver = require('./models/deliver')
const Review = require('./models/review')



if (process.argv.length < 4) {
  console.log('Please provide the password as an argument: node mongo.js <password> <secret_key>')
  process.exit(1)
}



const password = process.argv[2]
const url = `mongodb+srv://restaurant:${password}@cluster0.wtbvi.mongodb.net/<dbname>?retryWrites=true&w=majority`
const secret_key = process.argv[3]
const JWT_SECRET = `${secret_key}`



mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })



const typeDefs = gql`
  type Token {
    value: String!
    username: String!
    id: String!
    role: String!
  }

  type UserInfo {
    email: String!
    phone: String!
    street: String!
    street2: String
    city: String!
    postal_code: String!
  }

  type User {
    username: String!
    name: String
    passwordHash: String!
    role: String!
    info: UserInfo!
    reservations_history: [Reservation]!
    reviews_history: [Review]!
    deliverys_history: [Deliver]!
    id: ID!
  }

  type Food {
    name: String!
    description: String!
    category: String!
    price: Float!
    id: ID!
  }

  type Deliver {
    orderlists: [Food]!
    purchase_date: String!
    price: Float!
    ordered: Boolean!
    id: ID!
    user: User
    info: UserInfo
  }

  type Reservation {
    reservedAt: String!
    time: String!
    customers: Int!
    email: String
    phone: String
    check: Boolean!
    id: ID!
    user: User
  }

  type Review {
    user: User!
    title: String!
    comment: String!
    date: String!
    likes: Int!
    id: ID!
  }

  type Query {
    allFood: [Food!]!
    findSameKindFood(category: String!): [Food!]!
    findAllReviews: [Review!]!
    allReservations: [Reservation!]!
    me: User
  }

  type Mutation {
    addFood(
      name: String!
      description: String!
      category: String!
      price: Float!
    ): Food

    deleteFood(
      id: ID!
    ): Food

    updateFoodPrice(
      id: ID!
      price: Float!
    ): Food

    addReservation(
      reservedAt: String!
      time: String!
      customers: Int!
      email: String
      phone: String
      user: ID
    ): Reservation

    updateReservationCheck(
      id: ID!
      check: Boolean!
    ): Reservation

    addDeliver(
      user: ID
    ): Deliver

    updateDeliver(
      id: ID!
      orderlists: [ID]!
      user: ID
      price: Float!
      email: String,
      phone: String,
      street: String,
      street2: String,
      city: String,
      postal_code: String
    ): Deliver

    addReview(
      user: ID!
      title: String!
      comment: String!
    ): Review

    createUser(
      username: String!
      name: String
      passwordHash: String!
      role: String!
      email: String!
      phone: String!
      street: String!
      street2: String
      city: String!
      postal_code: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }

  type Subscription {
    reviewAdded: Review!
  }
`



const resolvers = {
  Query: {
    allFood: (root, args) => Food.find({}),
    findSameKindFood: (root, args) => Food.find({ category: args.category }),
    findAllReviews: (root, args) => Review.find({}),
    allReservations: (root, args) => Reservation.find({}).sort({ reservedAt: -1 }),
    me: (root, args, context) => context.currentUser
  }, 
  Food: { price: (root) => parseFloat(root.price) },
  Deliver: {
    price: (root) => parseFloat(root.price),
    info: (root) => {
      return {
        email: root.email,
        phone: root.phone,
        street: root.street,
        street2: root.street2,
        city: root.city,
        postal_code: root.postal_code
      }
    },
    async user(parent) {
      return await User.findById(parent.user)
    }, 
    async orderlists(parent) {
      return await parent.orderlists.map(ID => Food.findById(ID))
    }
  },
  Reservation: {
    async user(parent) {
      return await User.findById(parent.user)
    }
  },
  Review: {
    async user(parent) {
      return await User.findById(parent.user)
    }
  },
  User: {
    info: (root) => {
      return {
        email: root.email,
        phone: root.phone,
        street: root.street,
        street2: root.street2,
        city: root.city,
        postal_code: root.postal_code
      }
    },
    async reservations_history(parent) {
      return await parent.reservations_history.map(ID => Reservation.findById(ID))
    },
    async deliverys_history(parent) {
      return await parent.deliverys_history.map(ID => Deliver.findById(ID))
    },
    async reviews_history(parent) {
      return await parent.reviews_history.map(ID => Review.findById(ID))
    }
  },
  Mutation: {
    addFood: async (root, args) => {
      const food = new Food({ ...args })

      try {
        await food.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      
      return food
    },
    updateFoodPrice: async (root, args) => {
      const food = Food.findById(args.id)

      const foodSaved = {
        price: args.price
      }

      await Food.updateOne({_id: args.id}, foodSaved)
    },
    deleteFood: async (root, args) => {
      const food = await Food.findById(args.id)
      await Food.deleteOne({ _id: args.id })
      return food
    },
    addReservation: async (root, args) => {
      if (args.user !== undefined) {
        let loggedUser = await User.findById(args.user)
        const reservation = new Reservation({ ...args, user: loggedUser._id })
        
        try {
          var reservationSaved = await reservation.save()
          loggedUser.reservations_history = loggedUser.reservations_history.concat(reservationSaved._id)
          await loggedUser.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        
        return reservationSaved
      } else {
        const reservation = new Reservation({ ...args })

        try {
          await reservation.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        
        return reservation
      }  
    },
    updateReservationCheck: async (root, args) => {
      const reservationSaved = {
        check: args.check
      }

      return await Reservation.updateOne({_id: args.id}, reservationSaved)
    }, 
    addDeliver: async (root, args) => {
      if (args.user !== undefined) {
        let loggedUser = await User.findById(args.user)
        const deliver = new Deliver({ ...args, user: loggedUser._id })
        
        try {
          var deliverSaved = await deliver.save()
          loggedUser.deliverys_history = loggedUser.deliverys_history.concat(deliverSaved._id)
          await loggedUser.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        
        return deliverSaved
      } else {
        const deliver = new Deliver({ ...args })

        try {
          await deliver.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        
        return deliver
      }
    },
    updateDeliver: async (root, args) => {
      const deliver = await Deliver.findById(args.id)

      if (deliver.user !== null) {
        const deliverSaved = {
          ordered: true,
          price: args.price,
          orderlists: deliver.orderlists.concat(args.orderlists)
        }

        await Deliver.updateOne({_id: args.id}, deliverSaved)
      } else {
        const deliverSaved = {
            ordered: true,
            price: args.price,
            orderlists: deliver.orderlists.concat(args.orderlists),
            email: args.email,
            phone: args.phone,
            street: args.street,
            street2: args.street2,
            city: args.city,
            postal_code: args.postal_code
        }
  
        await Deliver.updateOne({_id: args.id}, deliverSaved)
      }
    },
    addReview: async (root, args) => {
      let loggedUser = await User.findById(args.user)
      
      if ( !loggedUser ) {
        throw new UserInputError("You must log in!")
      }

      const review = new Review({ ...args, user: loggedUser._id })
      
      try {
        var reviewSaved = await review.save()
        loggedUser.reviews_history = loggedUser.reviews_history.concat(reviewSaved._id)
        await loggedUser.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      
      pubsub.publish('REVIEW_ADDED',  { reviewAdded: review })

      return reviewSaved
    },
    createUser: async (root, args) => {
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(args.passwordHash, saltRounds)

      const user = new User({ ...args, passwordHash: passwordHash })

      try {
        await user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      
      return user
    },  
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(args.password, user.passwordHash)

      if ( !(user && passwordCorrect) ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET), username: user.username, id: user._id, role: user.role }
    },
  }, 
  Subscription: {
    reviewAdded: {
      subscribe: () => pubsub.asyncIterator(['REVIEW_ADDED'])
    },
  },
}



const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify( auth.substring(7), JWT_SECRET )
      const currentUser = await User.findById(decodedToken.id).populate('reservations_history').populate('reviews_history').populate('deliverys_history')
      return { currentUser }
    }
  }
})



server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})