import React from 'react'
import { Link } from "react-router-dom"
import { useSelector } from 'react-redux'
import { gql, useMutation } from '@apollo/client'
import Notification from './notification'
import axios from 'axios'



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



const ReservationSecond = ({ setReserve, setError, setSuccess, errorMessage, successMessage }) => {
  const [ addReservation ] = useMutation(ADD_RESERVATION)
  const reservation = useSelector(state => state.books)

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    const email = event.target.email.value
    const phone = event.target.phone.value

    event.target.email.value = ''
    event.target.phone.value = ''

    const reservedAt = reservation.reservedAt
    const time = reservation.time
    const customers = parseInt(reservation.customers)

    try {
      await addReservation({ variables: { reservedAt, time, customers, email, phone } })
    } catch (error) {
      setError(error.message)
    }

    var data = {
      service_id: 'service_d7tzr1g',
      template_id: 'template_od0ql1o',
      user_id: 'user_uLpm5LanNOvUTRchkjsAS',
      template_params: {
        date: reservedAt,
        time: time,
        customers: customers,
        email: email
      }
    }

    axios
      .post('https://api.emailjs.com/api/v1.0/email/send', data)
      .then((result) => {
        setSuccess("Book successfully!")
      }, (error) => {
        setError(JSON.stringify(error.message))
      })

    setReserve(false)
}
  

  return (
    <div className='book-bigger'> 
      <form onSubmit={handleSubmit} className="reservation-book-form">
        {/* Strangers */}
        <Notification errorMessage={errorMessage} successMessage={successMessage} />
        <input type='text' placeholder="E-mail" name='email' required />
        <input type='text' placeholder="Phone" name='phone' required />
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