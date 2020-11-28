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
import DeliverManager from './components/delivermanager'
import ReservationManager from './components/reservationmanager'
import MenuManager from './components/menumanager'
import bookReducer from './reducer/book'
import orderReducer from './reducer/order'
import deliverIDReducer from './reducer/deliverid'



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
  deliverid: deliverIDReducer,
})

const store = createStore(reducer)



const App = () => {
  const [ reserve, setReserve ] = useState(false)
  const [ deliver, setDeliver ] = useState(false)
  const [ checkout, setCheckout ] = useState(false)
  const [ register, setRegister ] = useState(false)
  const [ username, setUsername ] = useState(localStorage.getItem('username'))
  const [ token, setToken ] = useState(localStorage.getItem('token'))
  const [ userID, setUserID ] = useState(localStorage.getItem('userID'))
  const [ role, setRole ] = useState(localStorage.getItem('role'))

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
            
            <Route exact path="/checkout">
                <Checkout /> 
            </Route>

            <Route exact path="/register">
                {register
                    ? <Redirect to="/login" />
                    : <Register setRegister={setRegister} />
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
                      setReserve={setReserve}
                      setDeliver={setDeliver}
                      setCheckout={setCheckout}
                    />
                }
            </Route>

            <Route exact path="/reservation/signup">
                <ReservationSecond />
            </Route>

            <Route exact path="/reservation">
                {reserve
                  ? <Redirect to="/reservation/signup" />
                  : <Reservation 
                      setReserve={setReserve} 
                      userID={userID} 
                    />
                }
            </Route>

            <Route exact path="/deliver/signup">
                <DeliverSecond setDeliver={setDeliver} />
            </Route>

            <Route exact path="/deliver">
                {!deliver && !checkout && <Deliver 
                    userID={userID} 
                    setDeliver={setDeliver} 
                    setCheckout={setCheckout}
                />}
                {deliver && !checkout && <Redirect to='/deliver/signup' />}
                {!deliver && checkout && <Redirect to='/checkout' />}
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
      <App />
    </Provider>
  </ApolloProvider>, document.getElementById('root')
)