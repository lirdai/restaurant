import React, {useEffect} from 'react'
import { gql, useMutation } from '@apollo/client'
import Notification from './notification'



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
  

  //Form Validation
  const patterns = {
    username: /^[\w]{1,30}$/, 
    pwd: /^[\w-]{1,30}$/,  
    email: /^([a-zA-Z\d\.-]+)@([a-zA-Z\d-]+)\.([a-z{2,8}])(\.[a-z]{2,8})?$/, 
    phone: /^\d{11}$/, 
    street: /^[a-zA-Z\d\s]{1,50}$/, 
    city: /^[a-zA-Z]{1,30}$/, 
    postal_code: /^[a-zA-Z\d]{6,10}$/
  }

  const ERRORS = {
    username: "Username must contain lettes, digits and _, within 1~30", 
    pwd: "Password must contain lettes, digits, _, and -, within 1~30",  
    email: "Example: dai@gmail.com", 
    phone: "11 digits", 
    street: "within 50 letters", 
    city: "within 30 letters", 
    postal_code: "Example: L5G 20R or 230013"
  }

  const regex_validate = (event) => {
    if (patterns[event.target.attributes.name.value].test(event.target.value)) {
    } else {
      props.setError(ERRORS[event.target.attributes.name.value])
    }
  }


  const handleSubmit = async (event) => {
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

    try {
      await createUser({  variables: { username, name, passwordHash, role, email, phone, street, street2, city, postal_code } })
      props.setSuccess("Register Successfully, please log in !")
    } catch (error) {
      props.setError(error.message)
    } 

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
        <Notification errorMessage={props.errorMessage} successMessage={props.successMessage} />
        <input onKeyUp={regex_validate} type='text' name='username' placeholder='Username' required />
        <input type='text' name='name' placeholder='Name' />

        <div className='role-radio'>
          <div className='role'>
            <input type="radio" name="role" value="manager" required />
            <label>Manager</label>
          </div>

          <div className='role'>
            <input type="radio" name="role" value="courtier" required />
            <label>Courier</label>
          </div>

          <div className='role'>
            <input type="radio" name="role" value="user" required /> 
            <label>User</label>
          </div>
        </div>

        <input onKeyUp={regex_validate} type='text' name='email' placeholder='E-mail' required />
        <input onKeyUp={regex_validate} type='text' name='phone' placeholder='Phone' required/>
        <input onKeyUp={regex_validate} type='text' name='street' placeholder='Street' required/>
        <input type='text' name='street2' placeholder='Your partment No.' />
        <input onKeyUp={regex_validate} type='text' name='city' placeholder='City' required/>
        <input onKeyUp={regex_validate} type='text' name='postal_code' placeholder='Postal Code' required/>
        <input onKeyUp={regex_validate} type='password' name='pwd' placeholder='Password' required/>
        
        <input type="submit" value='Register' />
      </form>
    </div>
  )
}




export default Register