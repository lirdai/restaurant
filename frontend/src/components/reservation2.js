import React from 'react'
import { Link } from "react-router-dom"
import { useSelector } from 'react-redux'
import { gql, useMutation } from '@apollo/client'



const ADD_RESERVATION = gql`
mutation addReservation($reservedAt: String!, $time: String!, $customers: Int!, $email: String, $phone: String) {
  addReservation(
    reservedAt: $reservedAt
    time: $time
    customers: $customers
    email: $email
    phone: $phone
  ) {
    reservedAt
    time
    customers
  }
}
`



const ReservationSecond = () => {
  const [ addReservation ] = useMutation(ADD_RESERVATION)
  const reservation = useSelector(state => state.books)

  const handleSubmit = (event) => {
    event.preventDefault()
    
    const email = event.target.email.value
    const phone = event.target.phone.value

    event.target.email.value = ''
    event.target.phone.value = ''

    console.log(reservation)

    const reservedAt = reservation.reservedAt
    const time = reservation.time
    const customers = parseInt(reservation.customers)

    addReservation({ variables: { reservedAt, time, customers, email, phone } })
}
  

  return (
    <div className='book-bigger'> 
      <form onSubmit={handleSubmit} className="reservation-book-form">
        {/* Strangers */}
        <input type='text' placeholder="E-mail" name='email' />
        <input type='text' placeholder="Phone" name='phone' />
        <input type="submit" value='Book Now' />

        {/* Users */}
        <small>want to <Link to="/login">login</Link> ?</small>
        <small>Register as a <Link to="/register">user</Link>?</small>
      </form>

      {/* Link */}
      <div className='reservation-link'>
        <Link className='btn btn-info py-3 px-5' to="/">Go back Home</Link>
      </div>
    </div>
  )
}



export default ReservationSecond