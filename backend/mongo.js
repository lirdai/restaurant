// Library
const http = require('http')
const mongoose = require('mongoose')
const { ApolloServer, UserInputError, gql } = require('apollo-server-express')
const express = require("express")
const path = require("path")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()
const Stripe = require('stripe')
const { PubSub } = require('apollo-server')
const cors = require('cors')

// File
const Food = require('./models/menu')
const Reservation = require('./models/reservation')
const User = require('./models/user')
const Deliver = require('./models/deliver')
const Review = require('./models/review')



// if (process.argv.length < 4) {
//   console.log('Please provide the password as an argument: node mongo.js <password> <secret_key>')
//   process.exit(1)
// }


const pubsub = new PubSub()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)


const password = process.env.MONGO_PASSWORD
const JWT_SECRET = process.env.JWT_SECRET
const url = `mongodb+srv://restaurant:${password}@cluster0.wtbvi.mongodb.net/restaurant?retryWrites=true&w=majority`



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
    email: String!
  }

  type StripeSecretKey {
    clientSecret: String!
  }

  type UserInfo {
    email: String
    phone: String
    street: String
    street2: String
    city: String
    postal_code: String
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

  input OrderEntry {
    item: ID!
    quantity: Int!
    price: Float!
  }

  type OrderItem {
    item: Food!
    quantity: Int!
    price: Float!
  }

  type Food {
    name: String!
    description: String!
    category: String!
    price: Float!
    id: ID!
  }

  type Deliver {
    orderlist: [OrderItem]!
    purchase_date: String!
    price: Float!
    ordered: Boolean!
    accepted: Boolean!
    delivered: Boolean!
    id: ID!
    user: User
    courtier: User
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
    id: ID!
  }

  type Query {
    allFood: [Food!]!
    findSameKindFood(category: String!): [Food!]!
    findAllReviews: [Review!]!
    allReservations: [Reservation!]!
    allDelivers: [Deliver!]!
    findOneDeliver(id: ID!): [Deliver!]!
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

    createDeliver(
      orderlist: [OrderEntry]!
      price: Float!
      ordered: Boolean!
      user: ID
      email: String
      phone: String
      street: String
      street2: String
      city: String
      postal_code: String
    ): Deliver

    updateDeliverAccepted(
      id: ID!
      courtier: ID!
      accepted: Boolean!
    ): Deliver

    updateDeliverDelivered(
      id: ID!
      delivered: Boolean!
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

    stripeCharge(
      amount: Float!
    ): StripeSecretKey
  }

  type Subscription {
    reviewAdded: Review!
    ordered: Deliver!
    accepted: Deliver!
    delivered: Deliver!
  }
`



const resolvers = {
  Query: {
    allFood: () => Food.find({}),
    findSameKindFood: (root, args) => Food.find({ category: args.category }),
    findAllReviews: () => Review.find({}),
    allReservations: () => Reservation.find({}).sort({ reservedAt: -1 }),
    allDelivers: () => Deliver.find({}),
    findOneDeliver: (root, args) => Deliver.find({ _id: args.id }),
    me: (root, args, context) => context.currentUser
  }, 
  OrderItem: {
    async item(parent) {
      return await Food.findById(parent.item)
    }
  },
  Food: { price: (root) => parseFloat(root.price) },
  Deliver: {
    orderlist: (root) => {
      return root.orderlist.map(orderItem => {
        return {
          item: orderItem.item,
          quantity: orderItem.quantity,
          price: parseFloat(orderItem.price)
        }
      })
    },
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
    async courtier(parent) {
      return await User.findById(parent.courtier)
    }, 
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
        throw new UserInputError(error.message)
      }
      
      return food
    },
    updateFoodPrice: async (root, args) => {
      const food = await Food.findById(args.id)

      const foodSaved = {
        price: args.price
      }

      try {
        await Food.updateOne({_id: args.id}, foodSaved)
      } catch (error) {
        throw new UserInputError(error.message)
      }

      const update = {
        ...food._doc,
        id: food._id,
        price: args.price
      }

      return update
    },
    deleteFood: async (root, args) => {
      const food = await Food.findById(args.id)

      try {
        await Food.deleteOne({ _id: args.id })
      } catch (error) {
        throw new UserInputError(error.message)
      }

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
          throw new UserInputError(error.message)
        }
        
        return reservationSaved
      } else {
        const reservation = new Reservation({ ...args })

        try {
          await reservation.save()
        } catch (error) {
          throw new UserInputError(error.message)
        }
        
        return reservation
      }  
    },
    updateReservationCheck: async (root, args) => {
      const reservation = await Reservation.findById(args.id)

      const reservationSaved = {
        check: args.check
      }

      try {
        await Reservation.updateOne({_id: args.id}, reservationSaved)
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      const update = {
        ...reservation._doc,
        id: reservation._id,
        check: args.check
      }

      return update
    }, 
    createDeliver: async (root, args) => {
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
        
        const deliverUpdated = {
          ...deliverSaved._doc,
          id: deliverSaved._id
        } 

        return deliverUpdated
      } else {
        const deliver = new Deliver({ ...args })

        try {
          await deliver.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }

        const deliverUpdated = {
          ...deliver._doc,
          id: deliver._id
        }

        return deliverUpdated
      }
    },
    updateDeliverAccepted: async (root, args) => {
      const deliver = await Deliver.findById(args.id)

      const deliverSaved = {
        courtier: args.courtier,
        accepted: args.accepted
      }

      try {
        await Deliver.updateOne({_id: args.id}, deliverSaved)
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      const update = {
        ...deliver._doc,
        id: deliver._id,
        courtier: args.courtier,
        accepted: args.accepted
      }

      pubsub.publish("ACCEPTED", { accepted: update })

      return update
    },
    updateDeliverDelivered: async (root, args) => {
      const deliver = await Deliver.findById(args.id)

      const deliverSaved = {
        delivered: args.delivered
      }

      try {
        await Deliver.updateOne({_id: args.id}, deliverSaved)
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      const update = {
        ...deliver._doc,
        id: deliver._id,
        delivered: args.delivered
      }

      pubsub.publish("DELIVERED", { delivered: update })

      return update
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
      const username = await User.findOne({ username: args.username })

      if (username) {
        throw new UserInputError("username must be unique")
      }

      const saltRounds = 10
      const passwordHash = await bcrypt.hash(args.passwordHash, saltRounds)

      const user = new User({ ...args, passwordHash: passwordHash })

      try {
        await user.save()
      } catch (error) {
        throw new UserInputError(error.message)
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
  
      return { value: jwt.sign(userForToken, JWT_SECRET), 
                username: user.username, 
                id: user._id, 
                role: user.role ,
                email: user.email
              }
    },
    stripeCharge: async (root, args) => {
      const amount = args.amount

      try {
        var paymentIntent = await stripe.paymentIntents.create({
          amount, 
          currency: "cad"
        })
      } catch (error) {
        throw new UserInputError(error.message)
      }
      
      return { clientSecret: paymentIntent.client_secret }
    }
  }, 
  Subscription: {
    reviewAdded: {
      subscribe: () => pubsub.asyncIterator(['REVIEW_ADDED'])
    },
    ordered: {
      subscribe: () => pubsub.asyncIterator(['ORDERED'])
    },
    accepted: {
      subscribe: () => pubsub.asyncIterator(['ACCEPTED'])
    },
    delivered: {
      subscribe: () => pubsub.asyncIterator(['DELIVERED'])
    }
  },
}



const PORT = 4000
const app = express()

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
  },
  subscriptions: { path: '/graphql-ws' }
})

server.applyMiddleware({ app })
const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

app.use(cors())
app.use(express.static('build'))
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build','index.html'))
})

httpServer.listen(PORT, () => {
    console.log(`Server ready at ${PORT}${server.graphqlPath}`)
    console.log(`Subscriptions ready at ${PORT}${server.subscriptionsPath}`)
})