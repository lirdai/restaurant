import React, {useEffect} from 'react'
import { gql, useMutation } from '@apollo/client'



const CREATE_USER = gql`
mutation createUser($username: String!, $name: String, $passwordHash: String!, $role: String!, $email: String!, $phone: String!, $street: String!, $street2: String, $city: String!, $postal_code: String!) {
  createUser(
    username: $username,
    name: $name,
    passwordHash: $passwordHash,
    role: $role,
    email: $email,
    phone: $phone,
    street: $street,
    street2: $street2,
    city: $city,
    postal_code: $postal_code
  ) {
    username
  }
}
`



const Register = (props) => {
  const [ createUser, user ] = useMutation(CREATE_USER)

  const handleSubmit = (event) => {
    event.preventDefault()

    const username = event.target.username.value
    const name = event.target.name.value
    const passwordHash = event.target.pwd.value
    const role = event.target.role.value
    const email = event.target.email.value
    const phone = event.target.phone.value
    const street = event.target.street.value
    const street2 = event.target.street2.value
    const city = event.target.city.value
    const postal_code = event.target.postal_code.value

    createUser({  variables: { username, name, passwordHash, role, email, phone, street, street2, city, postal_code } })

    event.target.username.value = ''
    event.target.name.value = ''
    event.target.pwd.value = ''
    event.target.role.value = ''
    event.target.email.value = ''
    event.target.phone.value = ''
    event.target.street.value = ''
    event.target.street2.value = ''
    event.target.city.value = ''
    event.target.postal_code.value = ''
  }


  useEffect(() => {
    if ( user.data ) {
      props.setRegister(true)
    }
  }, [props, user.data])

  return (
    <div className="register-bigger">
      <h4>Register Here</h4>
      <br /><br />
      <form className='register-form' onSubmit={handleSubmit}>
        <input type='text' name='username' placeholder='Username (required)' />
        <input type='text' name='name' placeholder='Name' />

        <div className='role-radio'>
          <div className='role'>
            <input type="radio" name="role" value="manager" />
            <label>Manager</label>
          </div>

          <div className='role'>
            <input type="radio" name="role" value="courtier" />
            <label>Courier</label>
          </div>

          <div className='role'>
            <input type="radio" name="role" value="user" /> 
            <label>User</label>
          </div>
        </div>

        <input type='text' name='email' placeholder='E-mail (required)' />
        <input type='text' name='phone' placeholder='Phone (required)' />
        <input type='text' name='street' placeholder='Street (required)' />
        <input type='text' name='street2' placeholder='Your partment No.' />
        <input type='text' name='city' placeholder='City (required) ' />
        <input type='text' name='postal_code' placeholder='Postal Code (required) ' />
        <input type='password' name='pwd' placeholder='Password (required)' />
        
        <input type="submit" value='Register' />
      </form>
    </div>
  )
}



export default Register