import React, { useEffect } from 'react'
import { Link } from "react-router-dom"
import { gql, useMutation } from '@apollo/client'



const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(
      username: $username,
      password: $password
    ) {
      value
      username
      id
      role
    }
  }
`



const Login = (props) => {
  const [ login, result ] = useMutation(LOGIN)

  useEffect(() => {
    if ( result.data ) {
      const token = result.data.login.value
      const username = result.data.login.username
      const userID = result.data.login.id
      const role = result.data.login.role

      props.setToken(token)
      props.setUsername(username)
      props.setUserID(userID)
      props.setRole(role)
      props.setReserve(false)
      props.setDeliver(false)
      props.setCheckout(false)

      localStorage.setItem('token', token)
      localStorage.setItem('username', username)
      localStorage.setItem('userID', userID)
      localStorage.setItem('role', role)
    }
  }, [props, result.data])

  const handleSubmit = (event) => {
    event.preventDefault()

    const username = event.target.username.value 
    const password = event.target.pwd.value

    login({ variables: { username, password } })

    event.target.username.value = ''
    event.target.pwd.value = ''
  }


  return (
    <div className='login-bigger'>
        <h4>Log In Here</h4>
        <br /><br />
        <form className='login-form' onSubmit={handleSubmit}>
          <input type='text' name='username' placeholder='Username' />
          <input type='password' name='pwd' placeholder='Password' />
          <input type="submit" value='Log In' />

          <small>Don't have an account yet? Register as a <Link to="/register">user</Link>.</small>
        </form>
    </div>
  )
}



export default Login