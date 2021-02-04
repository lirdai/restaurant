// Dependencies
import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Switch, Route, Redirect
} from "react-router-dom"
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, split } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/client/link/ws'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { setContext } from 'apollo-link-context'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

// Static
import './decorator/styles.css'

// React.js
import Footer from './components/footer'
import Home from './components/home'
import Manager from './components/manager'
import Courtier from './components/courtier'
import Reservation from './components/reservation'
import ReservationSecond from './components/reservation2'
import Deliver from './components/deliver'
import DeliverSecond from './components/deliver2'
import Login from './components/login'
import Register from './components/register'
import Checkout from './components/checkout'
import Delivering from './components/delivering'
import DeliverManager from './components/delivermanager'
import ReservationManager from './components/reservationmanager'
import MenuManager from './components/menumanager'
import bookReducer from './reducer/book'
import orderReducer from './reducer/order'
import deliveridReducer from './reducer/deliverid'



const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token')

  return {
    headers: {
      ...headers,
      authorization: token ? `bearer ${token}` : null,
    }
  }
})

const httpLink = new HttpLink({ uri: 'http://localhost:4000' })

const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true
  }
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    )
  }, wsLink, authLink.concat(httpLink))

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink
})



const reducer = combineReducers({
  books: bookReducer,
  orders: orderReducer,
  deliverid: deliveridReducer
})

const store = createStore(reducer)



const stripePromise = loadStripe("pk_test_jfeD0SXgvoZ0qfB3nizgQGW500xwK6q5lo")



const App = () => {
  const [ reserve, setReserve ] = useState(false)
  const [ register, setRegister ] = useState(false)
  const [ errorMessage, setErrorMessage ] = useState(null)
  const [ successMessage, setSuccessMessage ] = useState(null)
  const [ username, setUsername ] = useState(localStorage.getItem('username'))
  const [ token, setToken ] = useState(localStorage.getItem('token'))
  const [ userID, setUserID ] = useState(localStorage.getItem('userID'))
  const [ role, setRole ] = useState(localStorage.getItem('role'))
  const [ email, setEmail ] = useState(localStorage.getItem('email'))

  
  //Notification
  const error_notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const success_notify = (message) => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage(null)
    }, 10000)
  }


  return (
    <div>
      <Router>
        <Switch>
            <Route exact path='/manager/menu'>
              <MenuManager />
            </Route>

            <Route exact path='/manager/reservation'>
              <ReservationManager />
            </Route>

            <Route exact path='/manager/deliver'>
              <DeliverManager />
            </Route>

            <Route exact path="/manager">
              {token
                ? <Manager 
                    setToken={setToken} 
                    setRole={setRole} 
                    setUserID={setUserID}
                    setUsername={setUsername}
                  />
                : <Redirect to='/' />
              }
            </Route>
           
            <Route exact path="/courtier">
              {token
                ? <Courtier 
                    setToken={setToken} 
                    setRole={setRole} 
                    setUserID={setUserID}
                    setUsername={setUsername}
                  />
                : <Redirect to='/' />
              }
            </Route>

            <Route exact path="/register">
                {register
                    ? <Redirect to="/login" />
                    : <Register 
                        setRegister={setRegister} 
                        setError={error_notify}
                        setSuccess={success_notify}
                        errorMessage={errorMessage}
                        successMessage={successMessage}
                      />
                }
            </Route>

            <Route exact path="/logout">
                <Redirect to="/" />
            </Route>

            <Route exact path="/login">
                {token
                  ? <Redirect to="/" />
                  : <Login 
                      setToken={setToken} 
                      setUsername={setUsername} 
                      setUserID={setUserID} 
                      setRole={setRole} 
                      setEmail={setEmail}
                      setReserve={setReserve}
                      setError={error_notify}
                      setSuccess={success_notify}
                      errorMessage={errorMessage}
                      successMessage={successMessage}
                    />
                }
            </Route>

            <Route exact path="/reservation/signup">
                <ReservationSecond 
                  setReserve={setReserve} 
                  setError={error_notify}
                  setSuccess={success_notify}
                  errorMessage={errorMessage}
                  successMessage={successMessage}
                />
            </Route>

            <Route exact path="/reservation">
                {reserve
                  ? <Redirect to="/reservation/signup" />
                  : <Reservation 
                      setReserve={setReserve} 
                      userID={userID} 
                      email={email}
                      setError={error_notify}
                      setSuccess={success_notify}
                      errorMessage={errorMessage}
                      successMessage={successMessage}
                    />
                }
            </Route>

            <Route exact path="/delivering">
              <Delivering 
                setError={error_notify}
                setSuccess={success_notify}
                errorMessage={errorMessage}
                successMessage={successMessage}
              /> 
            </Route>

            <Route exact path="/checkout">
              <Checkout userID={userID} /> 
            </Route>

            <Route exact path="/deliver/signup">
              <DeliverSecond />
            </Route>

            <Route exact path="/deliver">
              <Deliver userID={userID} />
            </Route>

            <Route exact path="/">
              {role === 'manager' && <Redirect to='/manager' />}
              {role === 'courtier' && <Redirect to='/courtier' />}
              <Home 
                token={token} 
                userID={userID} 
                username={username} 
                setToken={setToken} 
                setUsername={setUsername} 
                setUserID={setUserID} 
                setRole={setRole} 
              />
            </Route>
        </Switch>
      </Router>

      <Footer />
    </div>
  )
}



ReactDOM.render(
  <ApolloProvider client={client}>
    <Provider store={store}>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </Provider>
  </ApolloProvider>, document.getElementById('root')
)